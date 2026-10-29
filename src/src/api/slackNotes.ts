import { KN_SERVER_HOST } from 'src/utils/constants'
import type { SlackNotesBlock } from 'src/utils/slackMeetingNotes'
export type SlackNotesWorkspace={accountId:string;teamId:string;name:string;unavailable?:boolean}
export type SlackNotesChannel={id:string;name:string;private:boolean}
export type SlackNotesDestination={owner:string;accountId:string;teamId:string;channelId:string}
async function request<T>(path:string,body?:unknown):Promise<T>{
 const response=await fetch(`${KN_SERVER_HOST}/api/clawd/slack-notes/${path}`,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined)
 const value=await response.json();if(!response.ok||!value.success)throw new Error(value.error||'Slack sharing failed. No alternate destination was used.');return value.data
}
export const slackNotesWorkspaces=()=>request<{owner:string;accounts:SlackNotesWorkspace[]}>('workspaces')
export const slackNotesChannels=(destination:Omit<SlackNotesDestination,'channelId'>)=>request<{channels:SlackNotesChannel[]}>('channels',destination)
export const sendSlackNotes=(destination:SlackNotesDestination,message:{text:string;blocks:SlackNotesBlock[]},requestId:string)=>request<{state:string;channelId:string;teamId:string;ts:string}>('send',{...destination,...message,requestId})
const preferenceKey=(owner:string)=>`slack-notes-destination:v1:${owner}`
export function rememberedSlackDestination(owner:string):SlackNotesDestination|undefined{
 try{const value=JSON.parse(localStorage.getItem(preferenceKey(owner))||'null');return value?.owner===owner&&typeof value.accountId==='string'&&typeof value.teamId==='string'&&typeof value.channelId==='string'?value:undefined}catch{return undefined}
}
export function rememberSlackDestination(destination:SlackNotesDestination){localStorage.setItem(preferenceKey(destination.owner),JSON.stringify(destination))}
export async function slackNotesSendId(destination:SlackNotesDestination,message:unknown){
 const bytes=new TextEncoder().encode(JSON.stringify({destination,message}))
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('')
 const key=`slack-notes-send:v1:${destination.owner}:${hash}`
 const previous=localStorage.getItem(key);if(previous)return previous
 const id=crypto.randomUUID();localStorage.setItem(key,id);return id
}
