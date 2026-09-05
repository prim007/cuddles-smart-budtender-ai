import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Cuddles AI"

interface ArticleApprovedProps {
  name?: string
  title?: string
  blogUrl?: string
}

const ArticleApprovedEmail = ({
  name,
  title = 'your story',
  blogUrl = 'https://www.cuddles-ai.com/blog'
}: ArticleApprovedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Good news — your story has been vetted and is heading to the Cuddles blog 🌿</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Great news, ${name} 🎉` : 'Great news 🎉'}
        </Heading>
        <Text style={text}>
          Your story <strong>"{title}"</strong> has been vetted and approved by the {SITE_NAME} editorial team.
        </Text>
        <Text style={text}>
          It will be published on our blog shortly, and we'll be in touch directly about featuring and promoting your work to our readers.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={blogUrl}>
            Visit the Cuddles blog
          </Button>
        </Section>
        <Text style={text}>
          Thank you for contributing to the community — keep the stories coming.
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
  component: ArticleApprovedEmail,
  subject: (data: Record<string, any>) =>
    `Your story "${data?.title ?? 'submission'}" has been approved 🌿`,
  displayName: 'Article approved',
  previewData: {
    name: 'Budbase',
    title: 'THC Vapes, Explained: What’s Actually Inside the Pen',
    blogUrl: 'https://www.cuddles-ai.com/blog',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Outfit, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#ff6b35', margin: '0 0 20px', fontFamily: '"Space Grotesk", Arial, sans-serif' }
const text = { fontSize: '16px', color: '#55575d', lineHeight: '1.5', margin: '0 0 20px' }
const small = { fontSize: '12px', color: '#888', lineHeight: '1.5', margin: '20px 0 0' }
const btnContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#ff6b35', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
