export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 border-t text-sm text-gray-500">
      © {new Date().getFullYear()} FundManager · All rights reserved.
    </footer>
  );
}
