"use client";

import React from "react";
import styled from "styled-components";
import Image from "next/image";

interface PlaceCardProps {
    image: string;
    title: string;
    onClick?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ image, title, onClick }) => {
    return (
        <CardContainer onClick={onClick}>
            <ImageWrapper>
                <Image
                    src={image}
                    alt={title}
                    fill
                    style={{ objectFit: "cover" }}
                />
                <Overlay />
            </ImageWrapper>
            <CardTitle>{title}</CardTitle>
        </CardContainer>
    );
};

export default PlaceCard;

const CardContainer = styled.div`
  flex-shrink: 0;
  width: 320px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
`;

const CardTitle = styled.h3`
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;
