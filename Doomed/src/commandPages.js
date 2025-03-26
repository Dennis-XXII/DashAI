import { TotalClientsPage } from './pages/TotalClientsPage';
import { NewClientsPage } from './pages/NewClients';
import { TotalMembersPage } from './pages/TotalMembers';
import { NewMembersPage } from './pages/NewMembers';
import { TopSpendersPage } from './pages/TopSpenders';
import { UpcomingBirthdayPage } from './pages/MemberBirthdays';
import { MembershipTiersPage } from './pages/MembershipTiers';
import { NationalityPage } from './pages/NationalityPage';

export const CommandPages = [
  "Total Clients", "New Clients", "Total Memberships", "New Memberships","Membership Tiers",
  "Membership vs Clients","Nationality Breakdown","Age Range", "Member Birthdays", "Top Spenders"
].map((title, i) => ({
  path: `command${i + 1}`,
  title: title,
  element: (
    <div className="command-page">
      {title === "Total Clients" ? <TotalClientsPage /> :
      title === "New Clients" ? <NewClientsPage /> :
      title === "Total Memberships" ? <TotalMembersPage /> :
      title === "New Memberships" ? <NewMembersPage /> :
      title === "Membership Tiers" ? <MembershipTiersPage /> :
      title === "Nationality Breakdown" ? <NationalityPage /> :
      title === "Member Birthdays" ? <UpcomingBirthdayPage /> :
      title === "Top Spenders" ? <TopSpendersPage /> :
      
      <p>Content for {title} page.</p>}
    </div>
  ),
}));