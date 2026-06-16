import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

function tryParseJSON(text){
  try{ return JSON.parse(text) }catch(e){ return null }
}

function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(Boolean)
  if(lines.length<2) return null
  const headers = lines[0].split(',').map(h=>h.trim())
  const rows = lines.slice(1).map(l=>l.split(',').map(c=>c.trim()))
  return { headers, rows }
}

const ChartBlock = ({lang, value}) =>{
  const raw = value.trim()
  if(lang === 'json' || lang === 'chart' ){
    const parsed = tryParseJSON(raw)
    if(parsed && parsed.type && parsed.data){
      const opts = parsed.options || {}
      if(parsed.type === 'bar') return <Bar data={parsed.data} options={opts} />
      if(parsed.type === 'line') return <Line data={parsed.data} options={opts} />
    }
  }
  if(lang === 'csv'){
    const parsed = parseCSV(raw)
    if(parsed){
      const labels = parsed.rows.map(r=>r[0])
      const values = parsed.rows.map(r=>Number(r[1]||0))
      const data = { labels, datasets:[{ label: parsed.headers[1]||'value', data: values, backgroundColor: 'rgba(75,192,192,0.6)' }] }
      return <Bar data={data} />
    }
  }
  // fallback: render pre
  return <pre style={{whiteSpace:'pre-wrap',background:'#0b1220',color:'#dfeFFF',padding:12,borderRadius:8}}>{value}</pre>
}

const components = {
  img: (props)=> <img {...props} style={{maxWidth:'100%',borderRadius:8}} />,
  code({node, inline, className, children, ...props}){
    const match = /language-(\w+)/.exec(className || '')
    const lang = match ? match[1] : ''
    const value = String(children).replace(/\n$/, '')
    if(!inline){
      return <ChartBlock lang={lang} value={value} />
    }
    return <code className={className} {...props}>{children}</code>
  }
}

const MessageRenderer = ({content}) =>{
  return (
    <div className="message-renderer">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components} >
        {content || ''}
      </ReactMarkdown>
    </div>
  )
}

export default MessageRenderer
