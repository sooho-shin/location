"use client";

import React, { useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { KR, US, JP, CN, FR } from "country-flag-icons/react/3x2";
import { appLanguages, type AppLanguage } from "../lib/i18n";

const flagByLanguage: Record<AppLanguage, typeof KR> = {
    ko: KR,
    en: US,
    ja: JP,
    zh: CN,
    fr: FR,
};

interface HeaderProps {
    currentLanguage: AppLanguage;
    onLanguageChange: (language: AppLanguage) => void;
}

const Header: React.FC<HeaderProps> = ({ currentLanguage, onLanguageChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const CurrentFlag = flagByLanguage[currentLanguage];

    return (
        <HeaderContainer>
            <LogoWrapper>
                <Image src="/images/logo.svg" alt="Location Logo" width={138} height={18} />
            </LogoWrapper>

            <LangSelector onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <FlagIcon>
                    <CurrentFlag style={{ width: 24, height: 16, borderRadius: 2 }} />
                </FlagIcon>
                <DropdownArrow $isOpen={isDropdownOpen}>▼</DropdownArrow>

                {isDropdownOpen && (
                    <DropdownMenu>
                        {appLanguages.map((lang) => {
                            const FlagComponent = flagByLanguage[lang.code];
                            return (
                                <DropdownItem
                                    key={lang.code}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onLanguageChange(lang.code);
                                        setIsDropdownOpen(false);
                                    }}
                                    $isActive={lang.code === currentLanguage}
                                >
                                    <FlagComponent style={{ width: 20, height: 14, borderRadius: 2 }} />
                                    <span>{lang.name}</span>
                                </DropdownItem>
                            );
                        })}
                    </DropdownMenu>
                )}
            </LangSelector>
        </HeaderContainer>
    );
};

export default Header;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const LangSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const FlagIcon = styled.div`
  display: flex;
  align-items: center;
`;

const DropdownArrow = styled.span<{ $isOpen: boolean }>`
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0)")};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 150px;
  z-index: 101;
`;

const DropdownItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ $isActive }) => ($isActive ? "rgba(0, 0, 0, 0.05)" : "transparent")};
  
  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  span {
    font-family: "Pretendard", sans-serif;
    font-size: 14px;
    color: #333;
  }
`;
