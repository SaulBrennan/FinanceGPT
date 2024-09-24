import { useEffect, useReducer, useRef, useState, useCallback } from 'react'
import ClipboardJS from 'clipboard'
import { throttle } from 'lodash-es'
import { ChatGPTProps, ChatMessage, ChatRole } from './interface'

const scrollDown = throttle(
  () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  },
  300,
  {
    leading: true,
    trailing: false
  }
)

const requestMessage = async (
  url: string,
  messages: ChatMessage[],
  controller: AbortController | null
) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      messages
    }),
    signal: controller?.signal
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const data = response.body
  if (!data) {
    throw new Error('No data')
  }
  return data.getReader()
}

export const useChatGPT = (props: ChatGPTProps) => {
  const { fetchPath } = props
  const [, forceUpdate] = useReducer((x) => !x, false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [disabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isFirstInteraction, setIsFirstInteraction] = useState<boolean>(true)
  const controller = useRef<AbortController | null>(null)
  const currentMessage = useRef<string>('')

  const archiveCurrentMessage = useCallback(() => {
    const content = currentMessage.current
    currentMessage.current = ''
    setLoading(false)
    if (content) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content,
          role: ChatRole.Assistant
        }
      ])
      scrollDown()
    }
  }, [])

  const fetchMessage = useCallback(async (messages: ChatMessage[]) => {
    try {
      currentMessage.current = ''
      controller.current = new AbortController()
      setLoading(true)
      const reader = await requestMessage(fetchPath, messages, controller.current)
      const decoder = new TextDecoder('utf-8')
      let done = false
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        if (value) {
          const char = decoder.decode(value)
          if (char === '\n' && currentMessage.current.endsWith('\n')) {
            continue
          }
          if (char) {
            currentMessage.current += char
            forceUpdate()
          }
          scrollDown()
        }
        done = readerDone
      }
      archiveCurrentMessage()
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }, [fetchPath, archiveCurrentMessage])

  const onStop = useCallback(() => {
    if (controller.current) {
      controller.current.abort()
      archiveCurrentMessage()
    }
  }, [archiveCurrentMessage])

  const onSend = useCallback((message: ChatMessage) => {
    console.log('useChatGPT onSend - Before:', isFirstInteraction)
    setMessages((prevMessages) => [...prevMessages, message])
    fetchMessage([...messages, message])
    setIsFirstInteraction(false)
    console.log('useChatGPT onSend - After:', false)
  }, [messages, fetchMessage, isFirstInteraction])

  const onClear = useCallback(() => {
    console.log('useChatGPT onClear - Before:', isFirstInteraction)
    setMessages([])
    setIsFirstInteraction(true)
    console.log('useChatGPT onClear - After:', true)
  }, [isFirstInteraction])

  useEffect(() => {
    console.log('useChatGPT effect - isFirstInteraction:', isFirstInteraction)
  }, [isFirstInteraction])

  return {
    loading,
    disabled,
    messages,
    currentMessage,
    isFirstInteraction,
    setIsFirstInteraction,
    onSend,
    onClear,
    onStop
  }
}