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
        <meta name="description" content="A chat application powered by ChatGPT" />
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