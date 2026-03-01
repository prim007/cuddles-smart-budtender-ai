/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to Cuddles 🌿 — confirm your email to get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://rcigcarkcpinnniddxcm.supabase.co/storage/v1/object/public/email-assets/cuddles-logo.png" alt="Cuddles" width="48" height="48" style={logo} />
        <Text style={brand}>Cuddles</Text>
        <Heading style={h1}>Hey there! Welcome aboard ✌️</Heading>
        <Text style={text}>
          Thanks for joining{' '}
          <Link href={siteUrl} style={link}>
            <strong>Cuddles</strong>
          </Link>
          — your personal AI budtender. You're one step away from personalized
          strain recommendations, your own journal, and more.
        </Text>
        <Text style={text}>
          Just confirm your email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) and you're all set:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify My Email
        </Button>
        <Text style={footer}>
          Didn't sign up for Cuddles? No worries — just ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Outfit, Arial, sans-serif' }
const logo = { margin: '0 0 8px', borderRadius: '12px' }
const container = { padding: '32px 28px' }
const brand = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: 'hsl(350, 65%, 55%)',
  margin: '0 0 24px',
  fontFamily: 'Space Grotesk, Arial, sans-serif',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(270, 30%, 15%)',
  margin: '0 0 20px',
  fontFamily: 'Space Grotesk, Arial, sans-serif',
}
const text = {
  fontSize: '15px',
  color: 'hsl(270, 15%, 45%)',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const link = { color: 'hsl(350, 65%, 55%)', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(350, 65%, 55%)',
  color: 'hsl(30, 50%, 98%)',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
