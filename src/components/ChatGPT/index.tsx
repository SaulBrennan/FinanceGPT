import React, { useState, useCallback, useEffect } from 'react'
import { ChatGPTProps, ChatRole } from './interface'
import MessageItem from './MessageItem'
import SendBar from './SendBar'
import { useChatGPT } from './useChatGPT'
import './index.less'
import 'highlight.js/styles/atom-one-dark.css'

const ChatGPT = (props: ChatGPTProps) => {
  const {
    loading,
    disabled,
    messages,
    currentMessage,
    isFirstInteraction,
    setIsFirstInteraction,
    onSend: originalOnSend,
    onClear: originalOnClear,
    onStop
  } = useChatGPT(props)
  const [showBoxes, setShowBoxes] = useState(true)
  const [boxMessages, setBoxMessages] = useState<string[]>([])

  const boxStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    cursor: 'pointer',
    transition: 'background-color 0.5s',
  };

  const allBoxMessages = [
    '💳 Which credit cards offer the best cashback and rewards?',
    '🏠 Should I overpay my mortgage or invest in an ISA?',
    '📈 What is the top performing FTSE fund this year and why?',
    '💷 Workplace pension vs SIPP: Which is better for retirement?',
    '💰 How can I start building an emergency fund?',
    '📊 What is the difference between shares and gilts?',
    '🏦 How do I choose the right current account for my needs?',
    '🎓 What are the best strategies for repaying student loans?',
    '📱 Is it better to buy or get a contract for a new mobile?',
    '🚗 How do I negotiate the best price when buying a car?',
    '🏥 What should I know about private medical insurance?',
    '🏘️ Is now a good time to invest in property?',
    '💼 How can I effectively ask for a pay rise at work?',
    '🔑 What are the pros and cons of buying vs renting a flat?',
    '💹 How do I start investing in the stock market?',
    '🛍️ What are some effective strategies for reducing spending?',
    '🧾 How can I minimise my tax liability legally?',
    '🏭 What are ESG investments and should I consider them?',
    '🔒 How much should I save for retirement?',
    '💸 What is the best way to consolidate and pay off debt?',
    '📅 How do I create and stick to a monthly budget?',
    '🌍 What are the financial implications of moving abroad?',
    '👵 How do I financially prepare for care home costs?',
    '🎨 Is investing in premium bonds worth it? How do I start?'
    ];

  useEffect(() => {
    setBoxMessages(allBoxMessages.sort(() => 0.5 - Math.random()).slice(0, 4));
  }, []);

  const stripEmoji = (message: string) => {
    return message.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
  };

  const handleBoxClick = (message: string) => {
    const strippedMessage = stripEmoji(message);
    onSend({
      content: strippedMessage,
      role: ChatRole.User
    });
    if (setIsFirstInteraction) {
      setIsFirstInteraction(false);
    }
  };

  const onSend = useCallback((message: { content: string; role: ChatRole }) => {
    setShowBoxes(false);
    originalOnSend(message);
    if (setIsFirstInteraction) {
      setIsFirstInteraction(false);
    }
  }, [originalOnSend, setIsFirstInteraction]);

  const onClear = useCallback(() => {
    setShowBoxes(true);
    originalOnClear();
    if (setIsFirstInteraction) {
      setIsFirstInteraction(true);
    }
  }, [originalOnClear, setIsFirstInteraction]);

  return (
    <div className="chat-wrapper">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
      {currentMessage.current && (
        <MessageItem message={{ content: currentMessage.current, role: ChatRole.Assistant }} />
      )}
      <SendBar
        loading={loading}
        disabled={disabled}
        onSend={onSend}
        onClear={onClear}
        onStop={onStop}
        isFirstInteraction={isFirstInteraction}
        setIsFirstInteraction={setIsFirstInteraction}
      />
      {showBoxes && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginTop: '80px',
          height: '200px'
        }}>
          {boxMessages.map((message, index) => (
            <div
              key={index}
              style={boxStyle}
              onClick={() => handleBoxClick(message)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3FFF4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              title="Try this prompt"
            >
              <p style={{
                color: '#4b5563',
                fontSize: '1rem',
                lineHeight: '1.5',
                textAlign: 'center',
                margin: 0
              }}>
                {message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatGPT