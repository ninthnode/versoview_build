import { useState } from 'react';
import {
  Box,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  Button,
  Text,
} from '@chakra-ui/react';

const MultiSelectDropdown = ({ options, placeholder,setGenre,selectedOptions }) => {

  const handleSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setGenre(selectedOptions.filter((item) => item !== option));
    } else {
      setGenre([...selectedOptions, option]);
    }
  };

  const isSelected = (option) => selectedOptions.includes(option);

  return (
      <Menu closeOnSelect={false}>
        <MenuButton as={Button} 
            fontSize='sm' fontWeight="normal" h='fit-content' maxW='100%' textOverflow="ellipsis" whiteSpace="normal" p={2}>
        {selectedOptions.length > 0 ? selectedOptions.join(', ') : placeholder}
      </MenuButton>
      <MenuList overflowY='scroll' height='200px'>
        {options.map((option, index) => (
          <Box
            key={index}
            onClick={() => handleSelect(option.genre)}
            p={2}
            _hover={{ bg: 'gray.100' }}
            display="flex"
            alignItems="center"
            cursor="pointer"
          >
            <Checkbox isChecked={isSelected(option.genre)} mr={2} />
            <Text>{option.genre}</Text>
          </Box>
        ))}
      </MenuList>
    </Menu>
  );
};

export default MultiSelectDropdown;
