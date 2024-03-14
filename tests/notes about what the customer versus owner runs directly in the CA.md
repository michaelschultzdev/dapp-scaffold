CUSTOMER RUNS THIS:

base_account: (signer) - Signer wallet, the currently connected wallet. This is the lock manager/unlockee.

Owner: HAS to be the wallet that deployed. In the case of Documents > screenhots, we see that the owner is CD1zrb94BV9gbpA6LHiqoLChLF3pbJVNvSnsHYke3ukV

system program: 111111111111 (or maybe system ID on mainnet?)

fee account (same as owner in this case - I believe this collects the fee, if that's the case we may need to set this to our dev address in SolFi) : 65W4Wfb4KcMosGVD6d1PMMoAk5PwzpEaoqc3r9NZKwUk

Fee is 1 sol: 1000000000

fee rate = 2%

fee_amount: total amount vested \* 0.02

CREATE USER STATS FUNCTIONs::

user: deployer

userStats: user wallet that created the lock

Programid: 111111

base account = deployer

owner
