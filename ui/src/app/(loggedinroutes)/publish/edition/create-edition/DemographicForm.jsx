import { useState } from "react";
import { Box, Select, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";

function DemographicForm() {
  const [showDemographics, setShowDemographics] = useState(false);

  return (
    <Box>
      <Text fontWeight="bold" mb={2}>READER DEMOGRAPHICS</Text>
      <RadioGroup onChange={(value) => setShowDemographics(value === "add")} defaultValue="none">
        <Stack direction="row" spacing={4}>
          <Radio value="add">Add demographics</Radio>
          <Radio value="none">No demographics</Radio>
        </Stack>
      </RadioGroup>

      <Stack spacing={3} mt={4}>
        <Select placeholder="Select age range" isDisabled={!showDemographics}>
          <option value="17 or younger">17 or younger</option>
          <option value="18-20">18-20</option>
          <option value="21-29">21-29</option>
          <option value="30-39">30-39</option>
          <option value="40-49">40-49</option>
          <option value="50-59">50-59</option>
          <option value="60+">60+</option>
        </Select>

        <Select placeholder="Select status" isDisabled={!showDemographics}>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Divorced">Divorced</option>
          <option value="Separated">Separated</option>
          <option value="Other">Other (please specify)</option>
        </Select>

        <Select placeholder="Select no of dependents" isDisabled={!showDemographics}>
          <option value="None">None</option>
          <option value="One">One</option>
          <option value="Two">Two</option>
          <option value="Three to Five">Three to Five</option>
          <option value="More than five">More than five</option>
        </Select>

        <Select placeholder="Select education" isDisabled={!showDemographics}>
          <option value="Graduate degree">Graduate degree</option>
          <option value="Bachelor degree">Bachelor degree</option>
          <option value="Associate degree">Associate degree</option>
          <option value="Some college">Some college</option>
          <option value="High school">High school</option>
          <option value="Less than high school">Less than high school</option>
          <option value="Other">Other (please specify)</option>
        </Select>

        <Select placeholder="Select work status" isDisabled={!showDemographics}>
          <option value="Business owner">Business owner</option>
          <option value="Self-employed">Self-employed</option>
          <option value="Manager/Professional">Manager/Professional</option>
          <option value="Employed">Employed</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Retired">Retired</option>
          <option value="Other">Other (please specify)</option>
        </Select>

        <Select placeholder="Select household income" isDisabled={!showDemographics}>
          <option value="Under $30,000">Under $30,000</option>
          <option value="$30,000 – $49,999">$30,000 – $49,999</option>
          <option value="$50,000 – $69,999">$50,000 – $69,999</option>
          <option value="$70,000 – $89,999">$70,000 – $89,999</option>
          <option value="$90,000 – $109,999">$90,000 – $109,999</option>
          <option value="$110,000 +">$110,000 +</option>
        </Select>

        <Select placeholder="Select socio-economic" isDisabled={!showDemographics}>
          <option value="AB">AB</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="FG">FG</option>
        </Select>

        <Select placeholder="Select sex" isDisabled={!showDemographics}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other (please specify)</option>
        </Select>

        <Select placeholder="Select ethnic origins" isDisabled={!showDemographics}>
          <option value="Asian">Asian</option>
          <option value="Black or African-American">Black or African-American</option>
          <option value="Hispanic or Latino">Hispanic or Latino</option>
          <option value="White">White</option>
          <option value="From multiple races">From multiple races</option>
          <option value="Other">Other (please specify)</option>
        </Select>

        <Select placeholder="Select pets" isDisabled={!showDemographics}>
          <option value="None">None</option>
          <option value="Cat">Cat</option>
          <option value="Dog">Dog</option>
          <option value="Other">Other (please specify)</option>
        </Select>
      </Stack>
    </Box>
  );
}

export default DemographicForm;
