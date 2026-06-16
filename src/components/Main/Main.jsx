import React, { useContext } from 'react'
import './Main.css'
import {assets} from '../../assets/assets'
import { Context } from '../../Context/Context'
import MessageRenderer from '../Chat/MessageRenderer'

const Main = () => {

  const {onSent,recentPrompt,loading,notification,chatMessages,setInput,input,models,selectedModel,setSelectedModel} = useContext(Context);
  const [showModelDropdown,setShowModelDropdown] = React.useState(false);
  const chatEndRef = React.useRef(null);

  React.useEffect(()=>{
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length, loading]);

  const handleKeyDown = async (e) =>{
    if(e.key === 'Enter' && input.trim()){
      await onSent();
    }
  }

  const closeModelPopup = () => setShowModelDropdown(false);

  return (
    <div className='main'>
      <div className="nav">
        <p>BRAINWAVE</p>
        <img src={assets.user_icon} alt="" />
      </div>

      <div className="main-container">
        {chatMessages.length === 0 ? (
          <>
            <div className="greet">
              <p><span>Hello, Dev.</span></p>
              <p>How can I help you today?</p>
            </div>
            {/* <div className="cards">
              <div className="card">
                <p>Suggest Beautiful Places to see on an upcoming road trip</p>
                <img src={assets.compass_icon} alt="" />
              </div>
              <div className="card">
                <p>Briefly Summarize the concept : Urban Planning</p>
                <img src={assets.bulb_icon} alt="" />
              </div>
              <div className="card">
                <p>Brainstorm team bonding activities for our work retreat</p>
                <img src={assets.message_icon} alt="" />
              </div>
              <div className="card">
                <p>Improve the readability of the following code</p>
                <img src={assets.code_icon}  alt="" />
              </div>
            </div> */}
          </>
        ) : (
          <div className="result">
            <div className="chat-container">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={msg.role === 'user' ? 'message-row user-row' : 'message-row assistant-row'}>
                  <div className={msg.role === 'user' ? 'message-bubble user-bubble' : `message-bubble assistant-bubble ${msg.status === 'pending' ? 'pending' : ''}`}>
                    {msg.role === 'user' ? (
                      <p>{msg.text}</p>
                    ) : msg.status === 'pending' && !msg.text ? (
                      <div className="assistant-loader">
                        <span />
                        <span />
                        <span />
                      </div>
                    ) : (
                      <MessageRenderer content={msg.text} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        <div className="main-bottom">
          <div className="search-box">
            <button className="model-current" onClick={()=>setShowModelDropdown(p=>!p)}>
              {selectedModel ? selectedModel.replace('models/','') : 'Select model'}
              <span className="caret">▾</span>
            </button>

            <input onChange={(e)=>setInput(e.target.value)} onKeyDown={handleKeyDown} value={input} type="text" placeholder='Enter a prompt here' />
            <img src={assets.gallery_icon} alt="" />
            <img src={assets.mic_icon} alt="" />
            {input ? <img onClick={()=>onSent()} src={assets.send_icon} alt="" /> : null}
          </div>
          <p className='bottom-info'>
            Gemini may display inaccurate info, including about people, so double-check its responses. Your privacy & Gemini Apps
          </p>
        </div>
      </div>

      {showModelDropdown && (
        <div className="model-dropdown-overlay" onClick={closeModelPopup}>
          <div className="model-dropdown-modal" onClick={(e)=>e.stopPropagation()}>
            <h3>Select a model</h3>
            <div className="model-dropdown-list">
              {models && models.length > 0 ? models.map((m,idx) => (
                <button key={`${m}-${idx}`} className="model-option" onClick={()=>{ setSelectedModel(m); setShowModelDropdown(false)}}>
                  {m.replace('models/','')}
                </button>
              )) : (
                <div className="model-option empty">No models available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {notification && <div className="notification-toast">{notification}</div>}
    </div>
  )
}

export default Main
