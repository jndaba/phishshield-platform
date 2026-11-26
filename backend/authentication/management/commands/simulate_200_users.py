import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone

from authentication.models import UserProfile, ActivityAudit
from authentication.views import compute_and_sync_readiness
from lms_content.models import LearningModule, UserProgress
from simulation.models import SimulationScenario, SimulationResult, QuizSubmission
from simulation.views import seed_scenarios_if_needed, seed_quiz_if_needed


class Command(BaseCommand):
    help = "Simulates 200 learner accounts with realistic module, simulation, URL scan, and quiz activity."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=200,
            help="Number of simulated learners to generate (default: 200)",
        )
        parser.add_argument(
            "--cleanup",
            action="store_true",
            help="Delete previously generated sim_learner_* accounts before seeding",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        count = options["count"]

        if options["cleanup"]:
            deleted, _ = User.objects.filter(username__startswith="sim_learner_").delete()
            self.stdout.write(self.style.WARNING(f"Removed {deleted} existing simulated records."))
            if count == 0:
                return

        seed_scenarios_if_needed()
        seed_quiz_if_needed()

        modules = list(LearningModule.objects.all())
        scenarios = list(SimulationScenario.objects.all())

        existing_usernames = set(
            User.objects.filter(username__startswith="sim_learner_").values_list("username", flat=True)
        )

        # Pre-hash password once so 200 user creations finish in under 2 seconds
        shared_password_hash = make_password("SimPass2026!")

        sample_urls = [
            ("http://dkut-ac-ke.cloud-auth.online/login.php", "HIGH"),
            ("https://github.com/settings/tokens", "LOW"),
            ("http://192.168.1.105/mpesa/auth?token=9281", "CRITICAL"),
            ("https://console.cloud.google.com/billing", "LOW"),
            ("http://dhl-delivery-clearance.top/pay/settle.html", "HIGH"),
        ]

        created_users = 0
        for i in range(1, count + 1):
            username = f"sim_learner_{i:03d}"
            if username in existing_usernames:
                continue

            user = User.objects.create(
                username=username,
                email=f"learner{i:03d}@dkut.ac.ke",
                password=shared_password_hash,
                is_staff=False,
            )

            # Assign a realistic cohort distribution: 30% Beginner, 45% Intermediate, 25% Certified
            tier = random.choices(
                ["beginner", "intermediate", "certified"],
                weights=[0.30, 0.45, 0.25],
            )[0]

            if tier == "beginner":
                mod_ratio = random.uniform(0.05, 0.35)
                sim_count = random.randint(1, 4)
                sim_acc = random.uniform(0.40, 0.65)
                quiz_score = random.randint(8, 16)
            elif tier == "intermediate":
                mod_ratio = random.uniform(0.40, 0.85)
                sim_count = random.randint(5, 9)
                sim_acc = random.uniform(0.65, 0.85)
                quiz_score = random.randint(15, 20)
            else:
                mod_ratio = 1.0
                sim_count = len(scenarios)
                sim_acc = random.uniform(0.80, 1.0)
                quiz_score = random.randint(18, 25)

            # 1. Module Progress
            if modules:
                num_completed = round(len(modules) * mod_ratio)
                chosen_mods = random.sample(modules, min(num_completed, len(modules)))
                UserProgress.objects.bulk_create([
                    UserProgress(user=user, module=m, completed=True, score=100)
                    for m in chosen_mods
                ])

            # 2. Simulation Verdicts
            if scenarios:
                chosen_sims = random.sample(scenarios, min(sim_count, len(scenarios)))
                sim_rows = []
                for s in chosen_sims:
                    is_correct = random.random() <= sim_acc
                    choice = s.is_phishing if is_correct else (not s.is_phishing)
                    sim_rows.append(
                        SimulationResult(
                            user=user,
                            scenario=s,
                            user_choice_is_phishing=choice,
                            is_correct=is_correct,
                            attempted_at=timezone.now(),
                        )
                    )
                SimulationResult.objects.bulk_create(sim_rows)

            # 3. Assessment Quiz Submission
            passed = (quiz_score / 25 * 100) >= 70.0
            QuizSubmission.objects.create(
                user=user,
                score=quiz_score,
                total_questions=25,
                passed=passed,
            )

            # 4. Profile & Readiness Sync
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.simulations_completed = sim_count
            profile.streak_days = random.randint(1, 21)
            profile.save()
            readiness = compute_and_sync_readiness(user, profile)

            # 5. Realistic URL Scan & Cohort Audit Logs
            scanned_url, url_risk = random.choice(sample_urls)
            ActivityAudit.objects.bulk_create([
                ActivityAudit(
                    user=user,
                    title="URL Heuristic Analysis Executed",
                    description=f"Inspected target: {scanned_url}",
                    activity_type="url_scan",
                    risk_score=url_risk,
                ),
                ActivityAudit(
                    user=user,
                    title=f"Cohort Evaluation Completed ({readiness}% Readiness)",
                    description=f"Tier: {tier.capitalize()} | Quiz: {quiz_score}/25",
                    activity_type="assessment" if passed else "simulation",
                    risk_score="LOW" if readiness >= 70 else "MEDIUM",
                ),
            ])

            created_users += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully simulated {created_users} learners (Password for all: SimPass2026!)."
            )
        )