import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Cuddles AI"

interface WelcomeBackProps {
  name?: string
  lastTopic?: string
  chatUrl?: string
}

const WelcomeBackEmail = ({
  name,
  lastTopic = 'your favourite strains',
  chatUrl = 'https://www.cuddles-ai.com/#chat-demo'
}: WelcomeBackProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Cuddles remembered you — 3 fresh strain matches inside 🌿</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Hey ${name} 🌿` : 'Hey there 🌿'}
        </Heading>
        <Text style={text}>
          We noticed you stopped by {SITE_NAME} again — welcome back. Last time you asked about <strong>{lastTopic}</strong>, so we lined up three fresh strain matches you might love.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={chatUrl}>
            See my matches
          </Button>
        </Section>
        <Text style={text}>
          Want something different? Just open the chat and tell Cuddles your vibe — she'll handle the rest in under two seconds.
        </Text>
        <Text style={small}>
          Cannabis education only — not medical advice. Consult a healthcare professional for medical use.
        </Text>
        <Text style={footer}>The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeBackEmail,
  subject: 'Cuddles remembered you 🌿',
  displayName: 'Welcome back to Cuddles',
  previewData: { name: 'Friend', lastTopic: 'something for sleep', chatUrl: 'https://www.cuddles-ai.com/#chat-demo' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Outfit, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#ff6b35', margin: '0 0 20px', fontFamily: '"Space Grotesk", Arial, sans-serif' }
const text = { fontSize: '16px', color: '#55575d', lineHeight: '1.5', margin: '0 0 20px' }
const small = { fontSize: '12px', color: '#888', lineHeight: '1.5', margin: '20px 0 0' }
const btnContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#ff6b35', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
