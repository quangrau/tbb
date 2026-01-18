import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useNickname } from "../hooks/useNickname";
import { NicknamePrompt } from "./NicknamePrompt";

export function Navbar() {
  const location = useLocation();
  const { nickname, isLoading, setNickname } = useNickname();
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Show prompt if no nickname (after loading)
  if (!isLoading && !nickname) {
    return (
      <>
        <nav className="w-full bg-bb-surface border-b-3 border-bb-ink">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              to={ROUTES.home}
              className="font-display font-bold text-bb-ink text-lg hover:text-bb-primary transition-colors"
            >
              Battle Board
            </Link>
            <div className="flex gap-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-bb-lg border-2 border-bb-ink font-bold text-sm transition-colors ${
                    isActive(link.to)
                      ? "bg-bb-primary text-white"
                      : "bg-bb-surface hover:bg-bb-secondary text-bb-ink"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <NicknamePrompt onSubmit={handleNicknameSubmit} />
      </>
    );
  }

  return (
    <>
      <nav className="w-full bg-bb-surface border-b-3 border-bb-ink">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to={ROUTES.home}
            className="font-display font-bold text-bb-ink text-lg hover:text-bb-primary transition-colors"
          >
            Battle Board
          </Link>

          <div className="flex items-center gap-4">
            {/* Navigation links */}
            <div className="flex gap-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-bb-lg border-2 border-bb-ink font-bold text-sm transition-colors ${
                    isActive(link.to)
                      ? "bg-bb-primary text-white"
                      : "bg-bb-surface hover:bg-bb-secondary text-bb-ink"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Avatar with dropdown */}
            {nickname && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-2 py-1 rounded-bb-lg hover:bg-bb-secondary transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-bb-primary text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-bb-ink">
                    {getInitials(nickname)}
                  </div>
                  <span className="font-bold text-sm text-bb-ink hidden sm:block max-w-24 truncate">
                    {nickname}
                  </span>
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-bb-surface border-3 border-bb-ink rounded-bb-lg shadow-bb-neo py-1 z-50 min-w-32">
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
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

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
