from datetime import date, timedelta
import unittest
import xml.etree.ElementTree as ET
from update_profile import public_owned, streaks, render_activity, render_languages


class PublicProfileTests(unittest.TestCase):
    def test_private_and_other_owners_are_excluded(self):
        public = {"private": False, "owner": {"login": "lumiaxdev"}}
        private = {"private": True, "owner": {"login": "lumiaxdev"}}
        foreign = {"private": False, "owner": {"login": "someone-else"}}
        self.assertEqual(public_owned([public, private, foreign], "lumiaxdev"), [public])

    def test_streak_can_end_yesterday_and_is_not_total_active_days(self):
        today = date(2026, 10, 15)
        days = {(today-timedelta(days=n)).isoformat(): int(n in [1, 2, 4]) for n in range(6)}
        self.assertEqual(streaks(days, today), (2, 2))

    def test_zero_activity_is_valid_in_both_sizes(self):
        today = date(2026, 10, 15)
        days = {(today-timedelta(days=n)).isoformat(): 0 for n in range(365)}
        for mobile in [False, True]:
            output = render_activity(days, today, "15.10.2026", mobile)
            ET.fromstring(output)
            self.assertIn("0 Beiträge an 0 Tagen", output)

    def test_missing_calendar_days_fail_instead_of_fabricating_zeros(self):
        with self.assertRaises(ValueError):
            render_activity({}, date(2026, 10, 15), "15.10.2026")

    def test_empty_language_data_and_xml_escaping(self):
        for languages in [{}, {"A&B": 10}]:
            ET.fromstring(render_languages(languages, "15.10.2026"))


if __name__ == "__main__":
    unittest.main()
