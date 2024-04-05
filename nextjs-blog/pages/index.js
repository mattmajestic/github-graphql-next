// pages/index.js
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import styles from '../styles/Home.module.css'; // Make sure you have this CSS module for basic styling

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
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>GitHub Data</h1>
        <p>Total Stars: {totalStars}</p>
        <h2>Top Languages</h2>
        <ul className={styles.list}>
          {topLanguages.map(([language, count]) => (
            <li key={language} className={styles.listItem}>{language}: {count} repositories</li>
          ))}
        </ul>
      </div>
    </div>
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
