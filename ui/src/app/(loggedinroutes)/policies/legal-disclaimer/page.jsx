import React from 'react'
import { Box, Heading, Text, Stack, Container } from "@chakra-ui/react";

function LegalDisclaimer() {
  return (
    <Container maxW="container.lg" py={10}>
    <Heading as="h1" size="xl" mb={6} textAlign="center">
      Legal Disclaimer
    </Heading>

    <Stack spacing={6}>
      <Box>
        <Heading as="h2" size="sm" mb='2'>
          DISCLAIMER
        </Heading>
        <Text>
          “VersoView”, “us”, “we” or “our”, refer to OpenView PTE LTD: Reg:
          050531. operates the VersoView App and website (the “Service”).
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          YOUR INVESTMENTS ARE YOUR RESPONSIBILITY
        </Heading>
        <Text>
          We do not accept any liability for any loss or damage which is
          incurred from you acting or not acting as a result of reading any of
          our publications. You acknowledge that you use the information we
          provide at your own risk.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          INFORMATION, NOT ADVICE OR RECOMMENDATIONS
        </Heading>
        <Text>
          VERSOVIEW does not offer investment advice and nothing on this site
          should be construed as investment advice. Our website provides
          information and education for investors who can make their own
          investment decisions without advice.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          CARRY OUT YOUR OWN INDEPENDENT RESEARCH
        </Heading>
        <Text>
          You should carry out your own independent research before making any
          investment decision. VERSOVIEW does not take the specific needs,
          investment objectives, and financial situation of any particular
          individual into consideration.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          SEEK PROFESSIONAL ADVICE IF REQUIRED
        </Heading>
        <Text>
          If you are unsure of any investment decision, you should seek a
          professional financial advisor. VERSOVIEW is not a registered
          investment adviser and does not provide investment advice or
          recommendations.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          INVESTMENT RISKS
        </Heading>
        <Text>
          The value of investments can fall as well as rise. Past performance
          of an investment is not a guide to future performance. You should
          not buy shares with money you cannot afford to lose.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          TERMS OF USE
        </Heading>
        <Text>
          By using this website or our other services, you agree to comply
          with and be bound by the following Terms and Conditions of use.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          CHANGES TO THESE TERMS AND CONDITIONS
        </Heading>
        <Text>
          These Terms and Conditions may change at any time. Your continued
          use of our services means you agree to be bound by any updated
          terms.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          INTELLECTUAL PROPERTY
        </Heading>
        <Text>
          This website contains material owned by or licensed to us. Any
          reproduction of the content without permission is prohibited.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          LIMITATION OF LIABILITY
        </Heading>
        <Text>
          You are solely responsible for your own investment research,
          decisions, and results. VERSOVIEW is not liable for any loss or
          damage resulting from your use of our publications.
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="sm" mb='2'>
          GOVERNING LAW
        </Heading>
        <Text>
          Your use of this website and any dispute arising out of it is
          subject to the laws of the British Virgin Islands.
        </Text>
      </Box>

      <Text fontSize="sm" color="gray.500" textAlign="center" mt={8}>
        Last updated: 01.03.2025
      </Text>
    </Stack>
  </Container>
  )
}

export default LegalDisclaimer
