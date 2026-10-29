import {describe,it,expect} from 'vitest'
import {isNotesEditRequest,notesEditPrompt,validateNotesProposal} from './meetingNotesEdits'
const base='You represent Visa and will send the Visa criteria.\nMark will share Knapsack pricing.\nAlex owns legal review.\n> Frida: I represent Visa.\n> Mark: I will share pricing.'
const changes=[{before:'You represent Visa and will send the Visa criteria.',after:'Frida represents Visa and will send the Visa criteria.',reason:'Frida identifies her Visa role in the transcript.'}]
describe('meeting notes edit proposals',()=>{
 it('routes explicit corrections while ordinary Q&A remains Q&A',()=>{expect(isNotesEditRequest('You swapped me and Frida')).toBe(true);expect(isNotesEditRequest('Please rewrite the summary more concisely')).toBe(true);expect(isNotesEditRequest('What would you change about these notes?')).toBe(false);expect(isNotesEditRequest('Who owns legal review?')).toBe(false)})
 it.each([
  'Can you explain why you swapped me and Frida in the notes?',
  'Why did you swap me and Frida?',
  'Did you swap me and Frida?',
  'You swapped me and Frida?',
  'Explain the phrase "you swapped me and Frida".',
 ])('leaves attribution questions on the Q&A path: %s',text=>expect(isNotesEditRequest(text)).toBe(false))
 it.each(['"Frida: I represent Visa."', '“Frida: I represent Visa.”', "'Frida: I represent Visa.'", '‘Frida: I represent Visa.’', '"Frida: I represent Visa.\nMark: I own pricing."'])('protects inline quoted transcript: %s',quote=>{
  const original=`Evidence: ${quote}\nMark owns Knapsack pricing.`
  const raw=JSON.stringify({edits:[{before:'Frida: I represent Visa.',after:'Mark: I represent Visa.',reason:'swap'}],ambiguities:[]})
  expect(()=>validateNotesProposal(raw,original)).toThrow()
 })
 it.each(["Frida's role is Visa; Mark's role is Knapsack.", 'Frida’s role is Visa; Mark’s role is Knapsack.'])('does not interpret possessive apostrophes as quotations: %s',original=>{
  const raw=JSON.stringify({edits:[{before:'Visa',after:'Visa partnerships',reason:'targeted clarification'}],ambiguities:[]})
  expect(validateNotesProposal(raw,original).notes).toBe(original.replace('Visa','Visa partnerships'))
 })
 it('preserves a contraction inside a single-quoted transcript',()=>{
  const original="Evidence: 'Frida: I'm at Visa.'"
  const raw=JSON.stringify({edits:[{before:'Visa',after:'Knapsack',reason:'swap'}],ambiguities:[]})
  expect(()=>validateNotesProposal(raw,original)).toThrow()
 })
 it('corrects Mark/Frida attribution without swapping every name or quoted evidence',()=>{const p=validateNotesProposal(JSON.stringify({edits:changes,ambiguities:[]}),base);expect(p.notes).toBe(base.replace(changes[0].before,changes[0].after));expect(p.notes).toContain('Mark will share Knapsack pricing.');expect(p.notes).toContain('Alex owns legal review.');expect(p.notes).toContain('> Frida: I represent Visa.')})
 it('keeps uncertain attribution visible',()=>{expect(validateNotesProposal(JSON.stringify({edits:[],ambiguities:['Speaker 2 is not identified.']}),base).ambiguities).toEqual(['Speaker 2 is not identified.'])})
 it('rejects global, duplicate, overlapping and quoted evidence replacements',()=>{
  const proposal=(edits:unknown)=>JSON.stringify({edits,ambiguities:[]})
  expect(()=>validateNotesProposal(proposal([{before:'Mark',after:'Frida',reason:'swap'}]),base)).toThrow()
  expect(()=>validateNotesProposal(proposal([{before:'Frida: I represent Visa.',after:'Mark: I represent Visa.',reason:'swap'}]),base)).toThrow()
  expect(()=>validateNotesProposal(proposal([changes[0],{before:'You represent Visa',after:'Frida represents Visa',reason:'swap'}]),base)).toThrow()
  expect(()=>validateNotesProposal(proposal([{before:'secret',after:'x',reason:'rewrite'}]),'```\nsecret\n```')).toThrow()
 })
 it('supports a targeted rewrite and treats all context as data',()=>{const p=validateNotesProposal(JSON.stringify({edits:[{before:'long summary',after:'short summary',reason:'requested brevity'}],ambiguities:[]}),'Title\nlong summary\nActions');expect(p.notes).toBe('Title\nshort summary\nActions');expect(notesEditPrompt('You swapped me and Frida',base,'Authenticated user: Mark; Frida: Visa')).toContain('do not swap every occurrence')})
})
