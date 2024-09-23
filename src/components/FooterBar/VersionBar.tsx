import React from 'react'

import { Space } from 'antd'
export interface VersionBarProps {
  className?: string
}
const VersionBar = (props: VersionBarProps) => {
  const { className } = props

  return (
    <Space className={className} size={[46, 0]}>
    </Space>
  )
}

export default VersionBar
