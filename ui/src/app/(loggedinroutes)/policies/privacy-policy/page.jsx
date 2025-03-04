import React from 'react'
import { Box, Heading, Text, Stack, Container,Link,UnorderedList,ListItem } from "@chakra-ui/react";

function PrivacyPolicy() {
  return (
    <Container maxW="container.lg" py={10}>
    <Heading as="h1" size="xl" mb={6} textAlign="center">
        Privacy Policy
    </Heading>
    
    <Box>
        <Text>
            Effective date: March 01, 2025
        </Text>
        <Text>
            “VersoView”, “us”, “we” or “our”, refer to OpenView PTE LTD: Reg: 050531. operates the VersoView App and website (the “Service”).
        </Text>
    </Box>
    
    <Heading as="h2" size="sm" my="2">
        INFORMATION COLLECTION AND USE
    </Heading>
    <Box>
        <Text>
            We collect several different types of information for various purposes to provide and improve our Service to you.
        </Text>
    </Box>
    
    <Heading as="h2" fontSize='1.5rem' my="4">
        TYPES OF DATA COLLECTED
    </Heading>
    
    <Heading as="h3" size="sm" my="2">
        PERSONAL DATA
    </Heading>
    <Box>
        <Text>
            While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (“Personal Data”). Personally identifiable information may include, but is not limited to:
        </Text>
        <UnorderedList>
            <ListItem>Email address</ListItem>
            <ListItem>First name and last name</ListItem>
            <ListItem>Address, State, Province, ZIP/Postal code, City</ListItem>
            <ListItem>Cookies and Usage Data</ListItem>
        </UnorderedList>
    </Box>
    
    <Heading as="h3" size="sm" my="2">
        USAGE DATA
    </Heading>
    <Box>
        <Text>
            We may also collect information on how the Service is accessed and used (“Usage Data”). This Usage Data may include information such as your computer’s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.
        </Text>
    </Box>
    
    <Heading as="h3" size="sm" my="2">
        TRACKING & COOKIES DATA
    </Heading>
    <Box>
        <Text>
            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
        </Text>
    </Box>
    
    <Heading as="h2" size="sm" my="2">
        USE OF DATA
    </Heading>
    <Box>
        <Text>
            Galaxy Rendered Limited uses the collected data for various purposes:
        </Text>
        <UnorderedList>
            <ListItem>To provide and maintain the Service</ListItem>
            <ListItem>To notify you about changes to our Service</ListItem>
            <ListItem>To allow you to participate in interactive features of our Service when you choose to do so</ListItem>
            <ListItem>To provide customer care and support</ListItem>
            <ListItem>To provide analysis or valuable information so that we can improve the Service</ListItem>
            <ListItem>To monitor the usage of the Service</ListItem>
            <ListItem>To detect, prevent and address technical issues</ListItem>
        </UnorderedList>
    </Box>
    
    <Heading as="h2" size="sm" my="2">
        TRANSFER OF DATA
    </Heading>
    <Box>
        <Text>
            Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction.
        </Text>
        <Text>
            If you are located outside the United Kingdom and choose to provide information to us, please note that we transfer the data, including Personal Data, to the United Kingdom and process it there.
        </Text>
    </Box>
    
    <Heading as="h2" fontSize='1.5rem' my="4">
        DISCLOSURE OF DATA
    </Heading>
    <Heading as="h3" size="sm" my="2">
        LEGAL REQUIREMENTS
    </Heading>
    <Box>
        <Text>
            Galaxy Rendered Limited may disclose your Personal Data in the good faith belief that such action is necessary to:
        </Text>
        <UnorderedList>
            <ListItem>To comply with a legal obligation</ListItem>
            <ListItem>To protect and defend the rights or property of Galaxy Rendered Limited</ListItem>
            <ListItem>To prevent or investigate possible wrongdoing in connection with the Service</ListItem>
            <ListItem>To protect the personal safety of users of the Service or the public</ListItem>
            <ListItem>To protect against legal liability</ListItem>
        </UnorderedList>
    </Box>
    
    <Heading as="h2" size="sm" my="2">
        SECURITY OF DATA
    </Heading>
    <Box>
        <Text>
            The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
        </Text>
    </Box>
    
    <Heading as="h2" size="sm" my="2">
        CONTACT US
    </Heading>
    <Box>
        <Text>
            If you have any questions about this Privacy Policy, please contact us:
        </Text>
        <Text>
            By email: <Link color='blue' href='mailto:admin@versoview.com'>admin@versoview.com</Link>
        </Text>
    </Box>
</Container>

  )
}

export default PrivacyPolicy
