// Boost Sort Handler
// Sorts apps by spotlight, boost tier, and upload date
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const APPS = 'apps';


// Helper: Get priority for boost tier (Diamond=5, Bronze=1, null=0)
function getBoostPriority(tier) {
  switch ((tier || '').toLowerCase()) {
    case 'diamond': return 5;
    case 'platinum': return 4;
    case 'gold': return 3;
    case 'silver': return 2;
    case 'bronze': return 1;
    default: return 0;
  }
}

// Main sorting function for Zentrium app listings
export async function getSortedApps() {
  // Fetch all apps
  const appsSnap = await getDocs(collection(db, APPS));
  let apps = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Fetch spotlight winners (should be stored in a collection or app metadata)
  // Assume each app has: {spotlightWinner: boolean, spotlightTimestamp, boostTier, boostTimestamp, createdAt}
  const spotlightWinners = apps.filter(app => app.spotlightWinner === true);
  const boostedApps = apps.filter(app => !app.spotlightWinner && app.boostTier);
  const unboostedApps = apps.filter(app => !app.spotlightWinner && !app.boostTier);

  // Sort spotlight winners by spotlightTimestamp ascending (oldest first)
  spotlightWinners.sort((a, b) => {
    return (a.spotlightTimestamp || 0) - (b.spotlightTimestamp || 0);
  });

  // Sort boosted apps by boost tier (Diamond > Bronze), then by boostTimestamp descending (most recent first)
  boostedApps.sort((a, b) => {
    const tierDiff = getBoostPriority(b.boostTier) - getBoostPriority(a.boostTier);
    if (tierDiff !== 0) return tierDiff;
    // If same tier, most recently boosted first
    return (b.boostTimestamp || 0) - (a.boostTimestamp || 0);
  });

  // Sort unboosted apps by upload date (createdAt ascending)
  unboostedApps.sort((a, b) => {
    return (a.createdAt || 0) - (b.createdAt || 0);
  });

  // Concatenate all
  return [
    ...spotlightWinners,
    ...boostedApps,
    ...unboostedApps
  ];
}

export function boostTierPriority(tier) {
  const order = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', null];
  return order.indexOf(tier);
}
