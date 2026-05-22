import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Cuddles AI"

interface NewsletterConfirmationProps {
  name?: string
  confirmationUrl?: string
}

const NewsletterConfirmationEmail = ({ name, confirmationUrl = 'https://www.cuddles-ai.com' }: NewsletterConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your subscription to {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Hi ${name},` : 'Hello!'}
        </Heading>
        <Text style={text}>
          Thank you for signing up for the {SITE_NAME} newsletter! Please confirm your subscription to start receiving updates from us.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={confirmationUrl}>
            Confirm Subscription
          </Button>
        </Section>
        <Text style={text}>
          If you didn't sign up for this, you can safely ignore this email.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewsletterConfirmationEmail,
  subject: 'Confirm your subscription to Cuddles AI',
  displayName: 'Newsletter Subscription Confirmation',
  previewData: { name: 'Friend', confirmationUrl: 'https://example.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Outfit, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#ff6b35', margin: '0 0 20px', fontFamily: '"Space Grotesk", Arial, sans-serif' }
const text = { fontSize: '16px', color: '#55575d', lineHeight: '1.5', margin: '0 0 25px' }
const btnContainer = { textAlign: 'center' as const, marginBottom: '25px' }
const button = { backgroundColor: '#ff6b35', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }