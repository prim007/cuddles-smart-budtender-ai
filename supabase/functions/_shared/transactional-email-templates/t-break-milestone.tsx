import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Cuddles AI'

interface TBreakMilestoneProps {
  name?: string
  milestone?: string
  dayNumber?: number
  targetDays?: number
  completed?: boolean
  rewardCode?: string
  appUrl?: string
}

const TBreakMilestoneEmail = ({
  name,
  milestone = 'a new milestone',
  dayNumber = 1,
  targetDays = 7,
  completed = false,
  rewardCode,
  appUrl = 'https://www.cuddles-ai.com/t-break',
}: TBreakMilestoneProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {completed
        ? `You finished your ${targetDays}-day tolerance break 🎉`
        : `Day ${dayNumber} of ${targetDays} — ${milestone} unlocked 🌿`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {completed ? 'You did it 🎉' : `Day ${dayNumber} down 💪`}
        </Heading>
        <Text style={text}>
          {name ? `Hey ${name},` : 'Hey there,'}{' '}
          {completed
            ? `you just completed your ${targetDays}-day tolerance break. Your receptors have had a proper reset — go low and slow when you come back.`
            : `you've hit ${milestone} on your ${targetDays}-day tolerance break. Day ${dayNumber} is in the bag and the hardest part is behind you.`}
        </Text>

        {rewardCode && (
          <Section style={rewardBox}>
            <Text style={rewardLabel}>Your reward — 15% off your next order</Text>
            <Text style={rewardCodeStyle}>{rewardCode}</Text>
            <Text style={small}>
              Tell Cuddles what you want and mention this code at checkout.
            </Text>
          </Section>
        )}

        <Section style={btnContainer}>
          <Button style={button} href={appUrl}>
            {completed ? 'See my break summary' : 'Log today\u2019s check-in'}
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={small}>
          Cannabis education only — not medical advice. Consult a healthcare professional for medical use.
        </Text>
        <Text style={footer}>The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TBreakMilestoneEmail,
  subject: (data: Record<string, any>) =>
    data?.completed
      ? 'Tolerance break complete — your 15% reward is inside 🎉'
      : `Day ${data?.dayNumber ?? ''} of your tolerance break — nice work 🌿`,
  displayName: 'T-Break milestone',
  previewData: {
    name: 'Friend',
    milestone: 'the halfway mark',
    dayNumber: 4,
    targetDays: 7,
    completed: false,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Outfit, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#ff6b35', margin: '0 0 20px', fontFamily: '"Space Grotesk", Arial, sans-serif' }
const text = { fontSize: '16px', color: '#55575d', lineHeight: '1.5', margin: '0 0 20px' }
const small = { fontSize: '12px', color: '#888', lineHeight: '1.5', margin: '12px 0 0' }
const btnContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#ff6b35', borderRadius: '10px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 24px' }
const rewardBox = { backgroundColor: '#fff7ed', border: '1px solid #ffd7b5', borderRadius: '12px', padding: '18px 20px', textAlign: 'center' as const, margin: '8px 0 4px' }
const rewardLabel = { fontSize: '14px', color: '#9a5b2e', margin: '0 0 8px', fontWeight: 'bold' }
const rewardCodeStyle = { fontSize: '22px', color: '#ff6b35', letterSpacing: '1px', fontWeight: 'bold', margin: '0' }
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const footer = { fontSize: '14px', color: '#999', margin: '12px 0 0' }
