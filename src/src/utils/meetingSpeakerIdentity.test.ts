import {describe,it,expect} from 'vitest'
import {meetingSpeakerIdentityPrompt} from './meetingSpeakerIdentity'
describe('summary speaker identity prevention',()=>{
 it('anchors you to Mark without guessing a mapping for Frida',()=>{const prompt=meetingSpeakerIdentityPrompt({name:'Mark',email:'mark@example.invalid',emails:['mark@example.invalid']});expect(prompt).toContain('"name":"Mark"');expect(prompt).toContain('"you" and "your" refer ONLY');expect(prompt).toContain('not a mapping');expect(prompt).toContain('email domain');expect(prompt).toContain('flag uncertainty')})
 it('leaves missing identity unknown instead of assigning recorder ownership',()=>{expect(meetingSpeakerIdentityPrompt()).toContain('"name":"unknown"');expect(meetingSpeakerIdentityPrompt()).toContain('do not assign it to the user')})
})
