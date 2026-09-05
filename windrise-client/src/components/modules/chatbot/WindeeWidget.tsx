"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDownIcon, ChevronLeftIcon, MinusIcon, PowerIcon, XIcon } from "lucide-react";

import {
  closeChat,
  confirmPending,
  declinePending,
  forgetVisitor,
  chatStreamUrl,
  getSession,
  getVisitorId,
  requestHuman,
  resumeAi,
  sendChatMessage,
  startChat,
  uploadChatImage,
  type ChatMessage,
  type SupportState,
} from "@/services/chatbot/chatbot";
import { ChatScreen } from "./ChatScreen";
import { DetailsScreen, MenuScreen, WelcomeScreen } from "./WindeeScreens";
import { applyCartCard, applyWishlistCard } from "./windeeActions";
import { useCart } from "@/contexts/CartContext";

/**
 * Which of the nine states is on screen.
 *
 * "menu" and "chat" both need a session; "welcome" and "details" run before
 * one exists.
 */
type Screen = "welcome" | "details" | "menu" | "chat";

/** Matches the nav so the whole site moves on one curve. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The visitor id exists only in the browser, so it is read through a store
 * subscription rather than assigned from an effect: setting state during an
 * effect costs an extra render pass on every mount, and this value never
 * changes for the life of the page.
 *
 * Ending a chat clears the stored id; notifying then makes the snapshot mint a
 * fresh one, which is the only time this value moves.
 */
const visitorListeners = new Set<() => void>();

const subscribeVisitor = (notify: () => void) => {
  visitorListeners.add(notify);
  return () => visitorListeners.delete(notify);
};

const rotateVisitor = () => visitorListeners.forEach((notify) => notify());

export function WindeeWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const visitorId = useSyncExternalStore(
    subscribeVisitor,
    () => `${getVisitorId()}`,
    () => "",
  );

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");

  /**
   * Set as soon as the visitor moves themselves.
   *
   * Opening the panel kicks off a session fetch that decides which screen to
   * land on. If the visitor taps "Start Conversation" before that resolves,
   * the reply would put them straight back on the cover — so once they have
   * navigated, the bootstrap stops choosing for them.
   */
  const hasNavigated = useRef(false);

  const goTo = useCallback((next: Screen) => {
    hasNavigated.current = true;
    setScreen(next);
  }, []);

  const [name, setName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [handedOff, setHandedOff] = useState(false);
  const [support, setSupport] = useState<SupportState | null>(null);

  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useCart();

  /**
   * Carries out the bag and wishlist cards Windee sent.
   *
   * Both stores live in this browser, so the card is the instruction and this
   * is what performs it. Every path that fills `messages` runs through here —
   * the reply to a send, the transcript loaded on open, the live stream's
   * refetch — and each card is applied against its message id exactly once, so
   * seeing the same card again cannot add the item twice.
   */
  useEffect(() => {
    for (const message of messages) {
      const card = message.card;
      if (!card) continue;

      if (card.kind === "cart-added") {
        applyCartCard(message.id, card.item, addItem);
      } else if (card.kind === "wishlist-added") {
        applyWishlistCard(message.id, card.product);
      }
    }
  }, [messages, addItem]);

  /**
   * Picks up an existing conversation when the panel opens.
   *
   * This is what makes minimising cheap: the widget unmounts nothing on the
   * server, so reopening lands straight back in the transcript.
   */
  useEffect(() => {
    if (!open || !visitorId || sessionId) return;

    let cancelled = false;

    startChat(visitorId)
      .then((session) => {
        if (cancelled) return;
        setSessionId(session.sessionId);
        setName(session.name);
        setMessages(session.messages);
        setHandedOff(session.status === "HANDED_OFF");
        setSupport(session.support);
        // A returning visitor skips the cover; a new one starts at it — but
        // never yank someone off a screen they have already tapped through to.
        if (!hasNavigated.current) {
          setScreen(session.messages.length > 0 ? "chat" : session.name ? "menu" : "welcome");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't start the chat.");
      });

    return () => {
      cancelled = true;
    };
  }, [open, visitorId, sessionId]);

  const ensureSession = useCallback(
    async (details?: { name: string; phone: string }) => {
      const session = await startChat(visitorId, details);
      setSessionId(session.sessionId);
      setName(session.name);
      setMessages(session.messages);
      setHandedOff(session.status === "HANDED_OFF");
        setSupport(session.support);
      return session.sessionId;
    },
    [visitorId],
  );

  /**
   * Adds a message unless the transcript already has it.
   *
   * With a person on the thread two paths write to this list: the reply to a
   * POST, and the live stream's refetch. Whichever lands second was appending a
   * row the other had already inserted, which React sees as two children with
   * the same key. Identity is the message id, so checking it is enough.
   */
  const appendMessage = useCallback((incoming: ChatMessage) => {
    setMessages((current) => {
      // A handed-off send echoes the customer's own message back, so the
      // optimistic bubble it replaces has to go with it.
      const withoutPending =
        incoming.role === "USER"
          ? current.filter((m) => !m.id.startsWith("local-"))
          : current;

      return withoutPending.some((m) => m.id === incoming.id)
        ? withoutPending
        : [...withoutPending, incoming];
    });
  }, []);

  /** Optimistically shows what was typed, then swaps in Windee's reply. */
  const send = useCallback(
    async (text: string, imageUrl?: string | null, targetSession?: string) => {
      const id = targetSession ?? sessionId;
      if (!id) return;

      setError(null);
      setBusy(true);
      // Only while Windee is the one answering. Once the chat is with a person
      // the message goes to the support inbox and the bot deliberately stays
      // quiet, so its thinking card would be promising a reply that is never
      // coming — and an agent may take minutes, not seconds.
      setThinking(!handedOff);

      const pending: ChatMessage = {
        id: `local-${Date.now()}`,
        role: "USER",
        content: text,
        card: null,
        imageUrl: imageUrl ?? null,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, pending]);

      try {
        const reply = await sendChatMessage(visitorId, id, text, imageUrl);
        appendMessage(reply);
      } catch (err) {
        // The optimistic bubble is rolled back so the customer can retype
        // rather than being left with a message that was never answered.
        setMessages((current) => current.filter((m) => m.id !== pending.id));
        setError(err instanceof Error ? err.message : "Windee couldn't reply.");
      } finally {
        setBusy(false);
        setThinking(false);
      }
    },
    [sessionId, visitorId, handedOff, appendMessage],
  );

  const startFromMenu = async (prompt: string) => {
    goTo("chat");
    const id = sessionId ?? (await ensureSession());
    void send(prompt, null, id);
  };

  const act = async (run: () => Promise<ChatMessage>) => {
    setBusy(true);
    setError(null);
    try {
      const message = await run();
      appendMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Ends the conversation for good.
   *
   * The transcript is deleted server-side and the local session is dropped, so
   * reopening starts from the cover with nothing carried over. Minimising —
   * the chevron and the header's minus — deliberately does none of this.
   */
  const endChat = async () => {
    if (sessionId) {
      try {
        await closeChat(visitorId, sessionId);
      } catch {
        // Already gone, or offline. Either way the local state is cleared.
      }
    }

    forgetVisitor();
    rotateVisitor();
    setSessionId(null);
    setMessages([]);
    setName(null);
    setHandedOff(false);
    // Back to a clean slate, bootstrap included: the next open should be free
    // to choose the starting screen again.
    hasNavigated.current = false;
    setScreen("welcome");
    onClose();
  };

  /**
   * True from the moment the chat is handed over until the customer ends it.
   *
   * Covers the queue as well as an assigned agent: Windee has already stopped
   * answering by then, so a header still saying "AI Assistant" would be telling
   * the customer the wrong thing about who they are waiting for.
   */
  const withSupport = handedOff && support !== null;

  /**
   * The header's "End chat": leaves the agent and goes back to Windee.
   *
   * Distinct from `endChat` above, which deletes the whole conversation. The
   * transcript is kept here — the customer is returning to the bot, not
   * throwing away what they have already explained.
   */
  const leaveSupport = async () => {
    if (!sessionId) return;

    setBusy(true);
    setError(null);
    try {
      await resumeAi(visitorId, sessionId);
      setHandedOff(false);
      setSupport(null);
      const refreshed = await getSession(visitorId, sessionId);
      setMessages(refreshed.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't return to Windee.");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Live updates from the human side.
   *
   * Without this an agent's reply would sit unseen until the customer typed
   * something — and while queued the composer is disabled, so they cannot.
   *
   * It runs for the whole time the panel is open, not just once handed off.
   * An agent can now take a bot conversation over without being asked, and a
   * widget that only listened after a handoff would never hear it happen: the
   * customer would go on talking to a Windee that had already stopped
   * answering.
   */
  useEffect(() => {
    if (!open || !sessionId || !visitorId) return;

    const source = new EventSource(chatStreamUrl(visitorId, sessionId));

    // Every event here means the human side moved — an agent claimed it, replied
    // or closed it. Refetching keeps one shape in one place rather than mapping
    // the inbox's payloads onto the widget's.
    const refresh = () => {
      void getSession(visitorId, sessionId)
        .then((session) => {
          // Anything still in flight locally is kept on top of the server copy,
          // so a refresh landing mid-send does not blank what was just typed —
          // but only while the server has not caught up. Once the persisted
          // copy is in the transcript the optimistic one is a second bubble
          // with the same words, which reads as the message having been sent
          // twice.
          setMessages((current) => [
            ...session.messages,
            ...current.filter(
              (m) =>
                m.id.startsWith("local-") &&
                !session.messages.some(
                  (saved) => saved.role === "USER" && saved.content === m.content,
                ),
            ),
          ]);
          setSupport(session.support);
          setHandedOff(session.status === "HANDED_OFF");
        })
        .catch(() => {
          /* transient: the next event or send will catch up */
        });
    };

    source.addEventListener("message.created", refresh);
    source.addEventListener("conversation.updated", refresh);
    source.addEventListener("conversation.closed", refresh);

    return () => source.close();
  }, [open, sessionId, visitorId]);

  const header = (
    // The menu screen's artwork fills the panel, header included, so the bar
    // goes transparent there and lets the gradient through. Every other screen
    // keeps the solid background it had.
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        screen === "menu" ? "bg-transparent" : "bg-[#FCFBFE]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {screen === "details" && (
          <button
            type="button"
            onClick={() => goTo("welcome")}
            aria-label="Back"
            className="transition-colors "
          >
            <ChevronLeftIcon className="h-7 w-7 stroke-[1.5]" />
          </button>
        )}
        {/* The details screen already introduces Windee, large, a few lines
            below — the avatar and name in the bar are the same thing said
            twice. Every other screen keeps them. */}
        {screen !== "details" && (
          <>
        <Image
          src="/assets/Windee-Chatbot.png"
          alt=""
          width={30}
          height={30}
          className="h-[30px] w-[30px] select-none"
        />
        <div className="min-w-0 leading-tight">
          {withSupport ? (
            <>
              {/* The person, not the bot: while a human is on the thread the
                  header has to say so, or the customer keeps reading replies as
                  Windee's. */}
              <p className="truncate text-[13px] font-semibold text-[#1B1830]">Support Agent</p>
              <p className="flex items-center gap-1 text-[9px] text-[#1F9254]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1F9254]" />
                Online
              </p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-semibold text-[#6B4EE6]">Windee</p>
              <p className="text-[9px] text-[#9B98AC]">AI Assistant</p>
            </>
          )}
        </div>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {withSupport ? (
          // Leaves the agent and returns to Windee. Deliberately not the same
          // as the × below, which deletes the conversation outright.
          <button
            type="button"
            onClick={leaveSupport}
            disabled={busy}
            className="flex items-center gap-1 rounded-full border border-[#F3C9CB] bg-[#FDF3F3] px-2.5 py-1 text-[10.5px] font-medium text-[#D0342C] transition-colors hover:bg-[#FBE9E9] disabled:opacity-50"
          >
            <PowerIcon className="h-3 w-3" />
            End chat
          </button>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          aria-label="Minimise chat"
          title="Minimise — your conversation is kept"
          className="grid h-7 w-7 place-items-center rounded-full  transition-colors "
        >
          <ChevronDownIcon  className="h-7 w-7 stroke-[1.5]" />
        </button>
        {/* {!withSupport && (
          <button
            type="button"
            onClick={endChat}
            aria-label="End chat and delete this conversation"
            title="End chat — this conversation is deleted"
            className="grid h-7 w-7 place-items-center rounded-full  transition-colors  hover:text-[#B4413F]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )} */}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Chat with Windee"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.32, ease: EASE }}
          // Above the site header (z-9999): on phones the panel is full-screen,
          // and anything lower leaves the site's logo and menu button sitting
          // on top of Windee's own header. On desktop it is a floating card
          // that never overlaps the header anyway.
          // 340x705 from `sm` up, still capped against the viewport: 705px plus
          // the offset that clears the floating buttons wants an ~800px-tall
          // window, and a panel running off the top would take its own header
          // controls with it.
          //
          // Below `sm` it fills the screen instead — a fixed 340px frame would
          // leave dead margins on a 390px phone.
          className="pointer-events-auto fixed inset-0 z-[10005] flex flex-col overflow-hidden bg-white sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[705px] sm:max-h-[calc(100dvh-7.5rem)] sm:w-[340px] sm:max-w-[calc(100vw-2.5rem)] sm:rounded-2xl sm:border sm:border-[#ECEAF4] sm:shadow-[0_18px_50px_rgba(27,24,48,0.18)]"
        >
          {screen === "welcome" ? (
            <>
              {/* The cover carries its own artwork, so it gets a bare control
                  strip rather than the standard header. */}
              <div className="absolute right-6 top-5 z-10 flex gap-1">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Minimise chat"
                  className="grid h-7 w-7 place-items-center rounded-full  backdrop-blur transition-colors cursor-pointer"
                >
                  <ChevronDownIcon className="h-7 w-7 stroke-[1.5]" />
                </button>
              </div>
              <WelcomeScreen onStart={() => goTo("details")} />
            </>
          ) : (
            <>
              {/* On the menu screen the header floats over the artwork instead
                  of sitting above it in the flow — a transparent bar in the
                  flow would only reveal the panel's own white background. The
                  screen leaves room for it. */}
              <div
                className={
                  screen === "menu" ? "absolute inset-x-0 top-0 z-10" : "shrink-0"
                }
              >
                {header}
              </div>

              <div className="min-h-0 flex-1">
                {screen === "details" && (
                  <DetailsScreen
                    busy={busy}
                    onSubmit={async (details) => {
                      setBusy(true);
                      setError(null);
                      try {
                        await ensureSession(details);
                        setName(details.name);
                        goTo("menu");
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "Couldn't start the chat.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                )}

                {screen === "menu" && (
                  <MenuScreen
                    name={name}
                    onPick={startFromMenu}
                    onFreeChat={() => goTo("chat")}
                  />
                )}

                {screen === "chat" && (
                  <ChatScreen
                    messages={messages}
                    thinking={thinking}
                    busy={busy}
                    handedOff={handedOff}
                    support={support}
                    error={error}
                    onSend={(text, imageUrl) => void send(text, imageUrl)}
                    onConfirm={() =>
                      void act(() => confirmPending(visitorId, sessionId as string))
                    }
                    onDecline={() =>
                      void act(() => declinePending(visitorId, sessionId as string))
                    }
                    onTalkToHuman={() => {
                      setHandedOff(true);
                      void act(() => requestHuman(visitorId, sessionId as string));
                    }}
                    onContinueWithAi={() => {
                      setHandedOff(false);
                      if (sessionId) void resumeAi(visitorId, sessionId).catch(() => undefined);
                    }}
                    onUploadImage={uploadChatImage}
                  />
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
