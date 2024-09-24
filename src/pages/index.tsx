import Head from 'next/head'  // Add this import
import ChatGPT from '@/components/ChatGPT'
import { Layout } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import FooterBar from '@/components/FooterBar'
import HeaderBar from '@/components/HeaderBar'
import styles from './index.module.less'

export default function Home() {
  return (
    <>
      <Head>
        <title>Teev</title>
        <meta name="description" content="Your personal finance assistant: budgeting, investing, and money management advice in your pocket" />
      </Head>
      <Layout hasSider className={styles.layout}>
        <Layout>
          <HeaderBar />
          <Content className={styles.main}>
            <ChatGPT fetchPath="/api/chat-completion" />
          </Content>
          <FooterBar />
        </Layout>
      </Layout>
    </>
  )
}