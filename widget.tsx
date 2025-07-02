const city = "福州"
// 可选地域
// "中东"
// "东北"
// "西南"
// "南海"
// "西南"
// "日本"
const region = "中东"
// 可选数据源
// "GFS"
// "EC"
const model = "GFS"

/*
  Copyright (c) 2025 windowsair <dev@airkyi.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/
import {
  AppIntentManager,
  AppIntentProtocol,
  Button,
  Divider,
  fetch,
  Headers,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
  Widget
} from "scripting"

const RefreshDocsIntent = AppIntentManager.register({
  name: "RefreshDocsIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async () => {
    Widget.reloadAll()
  }
})

const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"

const getMapData = async () => {
  const header = new Headers()
  header.append("user-agent", ua)

  const requestOptions = {
    method: "GET",
    headers: header,
    redirect: "follow"
  }

  let query_id = Math.floor((Math.random() * 10000000) + 1).toString()

  // URLSearchParams can not use
  const uri = `https://sunsetbot.top/map/?region=${region}&event=set_1&intend=select_region&query_id=${query_id}&model=${model}`
  let response = await fetch(uri, requestOptions)
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`
    console.log(message)
    return ""
  }

  let ret = await response.json()
  console.log(ret)
  return "https://sunsetbot.top" + (ret.map_img_src ? ret.map_img_src : "")
}

const getSunsetData = async () => {
  const header = new Headers()
  header.append("user-agent", ua)
  const requestOptions = {
    method: "GET",
    headers: header,
    redirect: "follow"
  }

  let query_id = Math.floor((Math.random() * 10000000) + 1).toString()

  // URLSearchParams can not use
  const uri = `https://sunsetbot.top/?query_id=${query_id}&intend=select_city&query_city=${encodeURI(city)}&event_date=None&event=set_1&times=None&model=${model}`
  let response = await fetch(uri, requestOptions)

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`
    console.log(message)
    return {
      aod: "获取失败",
      quality: "获取失败"
    }
  }

  let ret = await response.json()
  console.log(ret)
  return ret
}


export function WidgetView({
  sunsetData,
  mapData
}: {
  sunsetData: any,
  mapData: any
}) {
  const aod = sunsetData.tb_aod.replace("<br>（", "    ").replace("）", "")
  const quality = sunsetData.tb_quality.replace("<br>（", "    ").replace("）", "")
  const updateTime = new Date().toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })

  if (Widget.family === "accessoryCircular") {
    return (
      <VStack
        frame={Widget.displaySize}
      >
      </VStack>
    )
  }

  return (
    <VStack
      alignment={"leading"}
      padding={{
        leading: true,
        top: true,
        bottom: true,
      }}
      frame={{
        maxHeight: "infinity",
        maxWidth: "infinity"
      }}
      clipShape={
        Widget.family === "accessoryRectangular"
          ? "capsule"
          : undefined
      }
    >
      <HStack
        padding={{
          trailing: true
        }}
      >
        <Text>🌇</Text>
        {Widget.family !== "systemSmall"
          ? <Text
            font={14}
            fontWeight={"bold"}
            foregroundStyle={"orange"}
          >今日日落 - {city}</Text>
          : null}

        <Spacer />

        <Button
          intent={RefreshDocsIntent(undefined)}
          tint={"purple"}
          buttonStyle={"plain"}
        >
          <Text>{updateTime}</Text>
        </Button>
      </HStack>
      <Divider />

      <HStack>
        <Text
          foregroundStyle="secondaryLabel"
          font={12}
          fontWeight="light"
        >
          鲜艳度
        </Text>
        <Text
          fontWeight="bold"
          foregroundStyle="systemRed"
        >
          {aod}
        </Text>
      </HStack>
      <HStack>
        <Text
          foregroundStyle="secondaryLabel"
          font={12}
          fontWeight="light"
        >
          气溶胶
        </Text>
        <Text
          fontWeight="bold"
          foregroundStyle="systemRed"
        >
          {quality}
        </Text>
      </HStack>
      <HStack>
        <Image
          resizable={
            {
              capInsets: undefined,
              resizingMode: "stretch"
            }
          }
          scaleToFit={true}
          imageUrl={mapData} />
      </HStack>
    </VStack>
  )
}

async function run() {
  let sunSetData = await getSunsetData()
  let mapData = await getMapData()

  Widget.present(
    <WidgetView
      sunsetData={sunSetData}
      mapData={mapData}
    />
  )
}

run()
