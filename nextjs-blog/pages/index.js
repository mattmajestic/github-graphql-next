// pages/index.js
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import {
  Box,
  Text,
  Heading,
  List,
  ListItem,
  Container,
  VStack,
  Badge,
  IconButton,
  useColorMode,
  Flex,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

// GraphQL query to fetch repositories, including star count and primary language
const GET_REPOSITORIES = gql`
  query GetUserRepositories($login: String!, $first: Int = 100) {
    user(login: $login) {
      repositories(first: $first, orderBy: {field: STARGAZERS, direction: DESC}) {
        edges {
          node {
            name
            stargazers {
              totalCount
            }
            primaryLanguage {
              name
            }
          }
        }
      }
    }
  }
`;

export default function Home({ totalStars, topLanguages }) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Container maxW="container.xl" centerContent p={8}>
      <VStack spacing={8} align="stretch">
        {/* Center the toggle button */}
        <Flex justify="center" width="full">
          <IconButton
            aria-label="Toggle dark mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            size="lg" // Adjust the size here, lg for larger button
            isRound={true} // Optional: makes the button round
            fontSize="2xl" // Makes the icon larger
          />
        </Flex>
        <Box p={8} shadow="xl" borderWidth="1px" flex="1" borderRadius="lg">
          <Heading fontSize="3xl">GitHub GraphQL API</Heading>
          <Text fontSize="2xl" mt={4}>Total Stars: {totalStars}</Text>
        </Box>
        <Box p={8} shadow="xl" borderWidth="1px" borderRadius="lg">
          <Heading fontSize="3xl">Top Languages</Heading>
          <List spacing={4} mt={4}>
            {topLanguages.map(([language, count]) => (
              <ListItem key={language} fontSize="xl">
                <Badge mr={2} colorScheme="green">{count}</Badge> {language}
              </ListItem>
            ))}
          </List>
        </Box>
      </VStack>
    </Container>
  );
}

export async function getStaticProps() {
  const { data } = await client.query({
    query: GET_REPOSITORIES,
    variables: {
      login: "mattmajestic", // Replace with your GitHub username
    },
  });

  const repositories = data.user.repositories.edges.map(edge => edge.node);

  // Calculate total stars
  const totalStars = repositories.reduce((acc, repo) => acc + repo.stargazers.totalCount, 0);

  // Tally languages
  const languageTally = repositories.reduce((acc, repo) => {
    const language = repo.primaryLanguage ? repo.primaryLanguage.name : "Unknown";
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});

  // Sort languages by usage
  const topLanguages = Object.entries(languageTally).sort((a, b) => b[1] - a[1]);

  return {
    props: {
      totalStars,
      topLanguages: topLanguages.slice(0, 5), // Adjust this to show more or fewer top languages
    },
  };
}
