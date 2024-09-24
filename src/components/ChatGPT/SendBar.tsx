import React, { KeyboardEventHandler, useRef, useEffect } from 'react'
import { ClearOutlined, SendOutlined } from '@ant-design/icons'
import { ChatRole, SendBarProps } from './interface'
import Show from './Show'

const SendBar = (props: SendBarProps) => {
  const { loading, disabled, onSend, onClear, onStop, isFirstInteraction, setIsFirstInteraction } = props
  const inputRef = useRef<HTMLTextAreaElement>(null)

  console.log('SendBar render - isFirstInteraction:', isFirstInteraction)

  useEffect(() => {
    console.log('SendBar effect - isFirstInteraction changed:', isFirstInteraction)
  }, [isFirstInteraction])

  const onInputAutoSize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }

  const handleClear = () => {
    console.log('SendBar handleClear - Before:', isFirstInteraction)
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.style.height = 'auto'
      setIsFirstInteraction(true) // Reset the interaction state
      onClear()
    }
    console.log('SendBar handleClear - After:', true)
  }

  const handleSend = () => {
    console.log('SendBar handleSend - Before:', isFirstInteraction)
    const content = inputRef.current?.value.trim()
    if (content) {
      inputRef.current!.value = ''
      inputRef.current!.style.height = 'auto'
      onSend({
        content,
        role: ChatRole.User
      })
      setIsFirstInteraction(false)
    }
    console.log('SendBar handleSend - After:', false)
  }

  const onKeydown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.shiftKey) {
      return
    }
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      console.log('SendBar onKeydown Enter - Before handleSend')
      e.preventDefault()
      handleSend()
      console.log('SendBar onKeydown Enter - After handleSend')
    }
  }

  return (
    <Show
      fallback={
        <div className="thinking">
          <span>Thinking</span>
          <div className="stop" onClick={onStop}>
            Stop
          </div>
        </div>
      }
      loading={loading}
    >
      <div className="send-bar">
        <textarea
          ref={inputRef!}
          className="input"
          disabled={disabled}
          placeholder={isFirstInteraction ? "How can Teev help you today?" : "Reply to Teev..."}
          autoComplete="off"
          rows={1}
          onKeyDown={onKeydown}
          onInput={onInputAutoSize}
        />
        <button 
          className="button" 
          title="Send" 
          disabled={disabled} 
          onClick={() => {
            console.log('SendBar Send button clicked')
            handleSend()
          }}
        >
          <SendOutlined />
        </button>
        <button 
          className="button" 
          title="Clear" 
          disabled={disabled} 
          onClick={() => {
            console.log('SendBar Clear button clicked')
            handleClear()
          }}
        >
          <ClearOutlined />
        </button>
      </div>
    </Show>
  )
}

export default SendBar