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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for Cuddles 🌿</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://rcigcarkcpinnniddxcm.supabase.co/storage/v1/object/public/email-assets/cuddles-logo.png" alt="Cuddles" width="48" height="48" style={logo} />
        <Text style={brand}>Cuddles</Text>
        <Heading style={h1}>Confirm your new email</Heading>
        <Text style={text}>
          You requested to change your Cuddles email from{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          . Tap below to confirm:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm Email Change
        </Button>
        <Text style={footer}>
          Didn't request this? Please secure your account immediately.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
