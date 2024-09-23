import React from 'react'

import { GithubOutlined } from '@ant-design/icons'
import { Layout, Space, Typography } from 'antd'

import styles from './index.module.less'

const { Link } = Typography

const { Header } = Layout

const HeaderBar = () => {
  return (
    <>
      <Header className={styles.header}>
        <div className={styles.logoBar}>
          <Link href="/">
            <img alt="logo" src="/logo.png" />
            <h1>Teev, <i>your own finance expert!</i></h1>
          </Link>
        </div>
      </Header>
      <div className={styles.vacancy} />
    </>
  )
}

export default HeaderBar
