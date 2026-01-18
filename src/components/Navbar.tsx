import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useNickname } from "../hooks/useNickname";
import { NicknamePrompt } from "./NicknamePrompt";
import { DropdownMenu } from "./ui/DropdownMenu";

export function Navbar() {
  const location = useLocation();
  const { nickname, isLoading, setNickname } = useNickname();
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const links = [
    { to: ROUTES.lobby, label: "Find Game" },
    { to: ROUTES.create, label: "Create" },
    { to: ROUTES.join, label: "Join" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNicknameSubmit = (newNickname: string) => {
    setNickname(newNickname);
    setShowEditPrompt(false);
  };

  const shouldPromptNickname = !isLoading && !nickname;

  return (
    <>
      <nav className="w-full bg-bb-bg">
        <div className="container mx-auto px-4 py-4">
          <div className="bg-bb-surface border-3 border-bb-ink rounded-full shadow-bb-neo px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
              <div className="relative flex items-center gap-2 sm:justify-self-start">
                <Link
                  to={ROUTES.home}
                  onClick={() => setShowMobileMenu(false)}
                  className="hidden sm:block font-display font-bold text-bb-ink text-lg hover:text-bb-primary transition-colors"
                >
                  Battle Board
                </Link>

                <DropdownMenu
                  open={showMobileMenu}
                  onOpenChange={setShowMobileMenu}
                  align="left"
                  panelClassName="w-56"
                  trigger={
                    <button
                      type="button"
                      aria-label="Open menu"
                      onClick={() => {
                        setShowDropdown(false);
                        setShowMobileMenu(!showMobileMenu);
                      }}
                      className={`sm:hidden h-10 w-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                        showMobileMenu
                          ? "text-bb-ink bg-bb-secondary"
                          : "text-bb-muted hover:text-bb-ink hover:bg-bb-secondary"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  }
                >
                  <div className="sm:hidden">
                    {links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setShowMobileMenu(false)}
                        className={`block px-3 py-2 text-sm font-bold transition-colors cursor-pointer first:rounded-t-bb-lg last:rounded-b-bb-lg ${
                          isActive(link.to)
                            ? "text-bb-ink bg-bb-secondary"
                            : "text-bb-ink hover:bg-bb-secondary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </DropdownMenu>
              </div>

              <div className="hidden sm:flex flex-wrap justify-center gap-1.5 sm:justify-self-center">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-full text-sm font-bold transition-colors ${
                      isActive(link.to)
                        ? "text-bb-ink bg-bb-secondary"
                        : "text-bb-muted hover:text-bb-ink hover:bg-bb-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {nickname ? (
                <div className="sm:justify-self-end">
                  <DropdownMenu
                    open={showDropdown}
                    onOpenChange={setShowDropdown}
                    align="right"
                    panelClassName="min-w-32"
                    trigger={
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowDropdown(!showDropdown);
                        }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-full hover:bg-bb-secondary transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 bg-bb-primary text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-bb-ink">
                          {getInitials(nickname)}
                        </div>
                        <span className="font-bold text-sm text-bb-ink hidden sm:block max-w-24 truncate">
                          {nickname}
                        </span>
                      </button>
                    }
                  >
                    <div className="px-3 py-2 border-b-2 border-bb-line">
                      <p className="text-xs text-bb-muted font-bold">
                        Signed in as
                      </p>
                      <p className="font-bold text-bb-ink truncate">
                        {nickname}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowEditPrompt(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm font-bold text-bb-ink hover:bg-bb-secondary transition-colors cursor-pointer"
                    >
                      Edit Nickname
                    </button>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="w-9 h-9" />
              )}
            </div>
          </div>
        </div>
      </nav>

      {shouldPromptNickname && (
        <NicknamePrompt onSubmit={handleNicknameSubmit} />
      )}

      {showEditPrompt && nickname && (
        <NicknamePrompt
          onSubmit={handleNicknameSubmit}
          initialValue={nickname}
          isEdit
          onCancel={() => setShowEditPrompt(false)}
        />
      )}
    </>
  );
}
