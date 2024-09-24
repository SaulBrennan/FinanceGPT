import React from 'react'
import { Layout } from 'antd'
import VersionBar from './VersionBar'
import styles from './index.module.less'

const { Footer } = Layout

const FooterBar = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Footer className={styles.footer}>
      <VersionBar className={styles.versionBar} />
      <div className={`${styles.copyright} ${styles.noSelect}`}>
        Teev can make mistakes. Check important info.
      </div>
    </Footer>
  )
}

export default FooterBar