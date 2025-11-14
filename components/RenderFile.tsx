import { Feather } from "@expo/vector-icons";
import { View, Image } from "react-native";
import { WebView } from "react-native-webview";
type File = {
  name: string;
  type: string;
  uri: string;
  mimeType?: string;
  base64?: string;
};

export const renderFile = (file: File) => {
  if (!file) {
    return (
      <View className="border border-dashed mb-4 flex-row rounded-lg items-center justify-center flex-1">
        <Feather name="file" size={50} color="#9CA3AF" />
      </View>
    );
  }

  if (file.type === "pdf") {
    if (file?.base64) {
      const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>html,body,#app{margin:0;padding:0;height:100%;width:100%;background:#fff}#app{overflow:auto;-webkit-overflow-scrolling:touch}canvas{display:block;margin:0 auto;}</style><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script></head><body><div id="app"></div><script>const b64='${file.base64}';const raw=atob(b64);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++){bytes[i]=raw.charCodeAt(i);}const pdfjsLib=window['pdfjsLib'];const app=document.getElementById('app');function render(){app.innerHTML='';pdfjsLib.getDocument({data:bytes}).promise.then(pdf=>{pdf.getPage(1).then(page=>{const dpr=window.devicePixelRatio||1;const unscaled=page.getViewport({scale:1});const containerWidth=app.clientWidth||window.innerWidth;const scale=containerWidth/unscaled.width;const viewport=page.getViewport({scale});const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';canvas.width=Math.floor(viewport.width*dpr);canvas.height=Math.floor(viewport.height*dpr);app.appendChild(canvas);page.render({canvasContext:ctx,viewport,transform:[dpr,0,0,dpr,0,0]});});});}render();let t;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(render,150);});</script></body></html>`;
      return (
        <WebView
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          mixedContentMode="always"
          allowFileAccess
          allowUniversalAccessFromFileURLs
          source={{ html }}
        />
      );
    }
    return (
      <WebView
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowFileAccess
        allowUniversalAccessFromFileURLs
        source={{ uri: file.uri }}
      />
    );
  }

  return (
    <View style={{ flex: 1, marginVertical: 10 }}>
      <Image
        source={{ uri: file.uri }}
        style={{ width: "100%", flex: 1 }}
        resizeMode="contain"
      />
    </View>
  );
};
