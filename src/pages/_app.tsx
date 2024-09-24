import Head from 'next/head'
import '@/styles/globals.css'
import 'antd/dist/antd.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,height=device-height,inital-scale=1.0,maximum-scale=1.0,user-scalable=no"
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-G40XGQ8Q69"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-G40XGQ8Q69');
            `,
          }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
