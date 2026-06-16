import { createContext, useState, useEffect, useRef } from "react";
import runChat, { getLatestModels } from "../Config/gemini";
 
export const Context = createContext();

const ContextProvider = (props) =>{

  const [input,setInput] = useState("");
  const [recentPrompt,setRecentPrompt] = useState("");
  const [prevPrompts,setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading,setLoading] = useState(false);
  const [resultData,setResultData] = useState("");
  const [chatError, setChatError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [models,setModels] = useState([]);
  const [selectedModel,setSelectedModel] = useState(null);
  const notificationTimeoutRef = useRef(null);

  const clearNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const getFriendlyNotification = (message, modelToUse) => {
    const normalized = String(message || '').toLowerCase();
    if (/model|unsupported|not found|invalid|404|403/.test(normalized)) {
      return selectedModel
        ? 'The selected model is unavailable. Please choose a different model from the selector.'
        : 'No model is selected. Pick a model from the dropdown before sending your question.';
    }
    if (/network|fetch|timeout|502|503|504|500/.test(normalized)) {
      return 'Network issue detected. Please try again in a moment.';
    }
    if (/key|permission|unauthorized|auth/i.test(normalized)) {
      return 'Authentication issue detected. Check your API key and try again.';
    }
    return 'Something went wrong. Please try again or select another model.';
  };

  const delayPara = (index,nextWord, assistantId) =>{
      setTimeout(function (){
         setChatMessages(prev=> prev.map(msg => msg.id === assistantId ? {...msg, text: msg.text + nextWord} : msg));
      }, 75*index);
  }
 
  const newChat = () =>{
    setLoading(false)
    setShowResult(false)
  }

  useEffect(()=>{
    let mounted = true;
    getLatestModels().then(list=>{
      if(!mounted) return;
      setModels(list || []);
      if(list && list.length>0) setSelectedModel(list[0])
    }).catch(()=>{});
    return ()=>{ mounted = false }
  },[])

  const onSent = async (prompt) =>{
    setResultData("");
    setChatError(null);
    setNotification(null);
    setLoading(true);
    setShowResult(true);

    const modelToUse = selectedModel || undefined;
    const userPrompt = prompt !== undefined ? prompt : input;
    const assistantId = `assistant-${Date.now()}`;

    if (!userPrompt?.trim()) {
      setNotification('Enter a prompt before sending.');
      clearNotification();
      setLoading(false);
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userPrompt,
      status: 'done',
    };

    const assistantMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      status: 'pending',
    };

    setChatMessages(prev => [...prev, userMessage, assistantMessage]);
    setRecentPrompt(userPrompt);
    setPrevPrompts(prev => [...prev, userPrompt]);

    try {
      const response = await runChat(userPrompt, modelToUse);

      let contentText = "";
      if (typeof response === 'string'){
        contentText = response;
      } else if (response && response.response) {
        const candidates = response.response.candidates || response.candidates || null;
        if (candidates && candidates.length > 0) {
          const candidate = candidates[0];
          const content = candidate.content || candidate;
          if (typeof content === 'string') contentText = content;
          else if (content.text) contentText = content.text;
          else if (content.parts) contentText = content.parts.map(p=>p.text||"").join(' ');
          else contentText = JSON.stringify(content);
        } else if (typeof response.response.text === 'function'){
          try{ contentText = response.response.text(); }catch(e){ contentText = String(response.response.text); }
        } else if (response.response.text) {
          contentText = String(response.response.text);
        } else {
          contentText = JSON.stringify(response);
        }
      } else {
        contentText = String(response);
      }

      const words = contentText.split(/(\s+)/);
      for(let i=0;i<words.length;i++){
        delayPara(i, words[i], assistantId);
      }

      setTimeout(() => {
        setChatMessages(prev => prev.map(msg => msg.id === assistantId ? {...msg, status: 'done'} : msg));
      }, words.length * 75 + 100);

      setInput("");
    } catch (error) {
      setChatMessages(prev => prev.filter(msg => msg.id !== assistantId));
      const message = error?.message ? error.message : 'An unknown error occurred while sending your request.';
      const userFriendly = getFriendlyNotification(message, modelToUse);
      setNotification(userFriendly);
      clearNotification();
    } finally {
      setLoading(false);
    }
  }

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    chatError,
    notification,
    chatMessages,
    input,
    setInput,
    newChat,
    models,
    selectedModel,
    setSelectedModel
  }

  return(
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  )
}

export default ContextProvider;