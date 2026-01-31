import Wallet from "./Wallet";
import CreateWallet from "./CreateWallet";

export default function WalletEntry({ user, refreshUser }) {
  if (!user) return <p>Loading...</p>;

  if (!user.wallet_id) {
    return <CreateWallet user={user} refreshUser={refreshUser} />;
  }

  return <Wallet user={user} />;
}
