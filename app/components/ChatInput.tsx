interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full p-2 border border-gray-300 rounded shadow-sm"
            value={input}
            onChange={onInputChange}
            placeholder="Ask about GitHub issues..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
} 