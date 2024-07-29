import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Badge, Button, Stack } from '@chakra-ui/react';

function Publications({userPosts}) {
  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              PUBLICATIONS – 3
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <Accordion defaultIndex={[0]} allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Summer 2023, June 1 2023
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Stack spacing={0}>
                  {[
                    { category: "Outdoor Living", title: "The Green Room", warning: true },
                    { category: "Outdoor Living", title: "Farm to Plate", warning: true },
                    { category: "Trends", title: "Heavy Fabrics" },
                    { category: "Trends", title: "Spring Forward" },
                    { category: "Style", title: "7 Ways to Upgrade Your Outdoor" },
                    { category: "Style", title: "Focus on the Front Yard" },
                    { category: "Travel", title: "Maldives" },
                  ].map((item, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center" p={2} borderWidth="1px" borderRadius="md">
                      <Box>
                        {item.warning && <Badge colorScheme="yellow" mr={2}>⚠️</Badge>}
                        <Badge mr={2}>{item.category}</Badge>
                        {item.title}
                      </Box>
                      <Button size="sm" colorScheme="red">Edit</Button>
                    </Box>
                  ))}
                  <Button p='0'>Load next 10...</Button>
                </Stack>
              </AccordionPanel>
            </AccordionItem>

            {/* Other sections (Spring 2023, Winter 2022) would be added similarly */}
          </Accordion>
        </AccordionPanel>
      </AccordionItem>

      {/* Posts section */}
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              POSTS – {userPosts?userPosts.length:0}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
                <Stack spacing={0}>
                  {userPosts&&userPosts.map((item, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center" p={2} borderWidth="1px" borderRadius="md">
                      <Box>
                        {item.header}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

export default Publications;
