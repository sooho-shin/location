'use client'

import styled from 'styled-components';

const Main = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: #333;
`;

export default function Home() {
  return (
    <Main>
      <Title>Welcome to LOCATION</Title>
    </Main>
  );
}
