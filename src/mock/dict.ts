export const mockApi = {
  getDicts: () => {
    return new Promise<{data: CommonResp<Dict[]>}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            state: '000001',
            msg: null,
            data: [
              {
                name: 'languages',
                description: '支持的语言',
                data: [
                  { name: '英语', code: 'en' },
                  { name: '日语', code: 'ja' },
                  { name: '韩语', code: 'ko' }
                ]
              },
              {
                name: 'translate_channels',
                description: '翻译渠道',
                data: [
                  { name: '谷歌翻译', code: 'google' },
                  { name: '百度翻译', code: 'baidu' },
                  { name: '有道翻译', code: 'youdao' }
                ]
              }
            ],
            request_id: `mock_${Date.now()}`
          }
        })
      }, 500)
    })
  }
} 