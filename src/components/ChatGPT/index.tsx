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
    '💳 What are the best current credit card reward offers?',
    '🏠 Should I overpay my mortgage or invest the extra money?',
    '📈 What is the top performing fund this year and why?',
    '💷 Workplace pension vs SIPP: Which is better for UK retirement?',
    '💰 How can I start building an emergency fund?',
    '📊 What is the difference between stocks and bonds?',
    '🏦 How do I choose the right bank account for my needs?',
    '🎓 What are the best strategies for paying off student loans?',
    '📱 Is it better to buy or lease a new smartphone?',
    '🚗 How do I negotiate the best price when buying a car?',
    '🏥 What should I know about health savings accounts (HSAs)?',
    '🏘️ Is now a good time to invest in real estate?',
    '💼 How can I ask for a raise at work effectively?',
    '🔑 What are the pros and cons of buying vs renting a home?',
    '💹 How do I start investing in the stock market?',
    '🛍️ What are some effective strategies for reducing spending?',
    '🧾 How can I minimize my tax liability legally?',
    '🏭 What are ESG investments and should I consider them?',
    '🔒 How much should I save for retirement?',
    '💸 What is the best way to consolidate and pay off debt?',
    '📅 How do I create and stick to a monthly budget?',
    '🌍 What are the financial implications of moving abroad?',
    '👵 How do I financially prepare for long-term care needs?',
    '🎨 Is art a good investment? How do I start?'
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
          marginTop: '50px',
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