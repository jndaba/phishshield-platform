import random
from locust import HttpUser, task, between


class PhishShieldLiveLearner(HttpUser):
    # Realistic human think-time between actions (1 to 4 seconds)
    wait_time = between(1, 4)

    def on_start(self):
        user_num = random.randint(1, 200)
        self.username = f"sim_learner_{user_num:03d}"
        self.token = None

        with self.client.post(
            "/api/auth/login/",
            json={"username": self.username, "password": "SimPass2026!"},
            catch_response=True,
            name="/api/auth/login/",
        ) as res:
            if res.status_code == 200:
                self.token = res.json().get("access")
                self.client.headers.update({"Authorization": f"Bearer {self.token}"})
                res.success()
            else:
                res.failure(f"Login failed for {self.username}: {res.status_code}")

    @task(4)
    def view_dashboard_and_stats(self):
        if not self.token:
            return
        self.client.get("/api/auth/user-stats/", name="/api/auth/user-stats/")

    @task(3)
    def study_and_complete_module(self):
        if not self.token:
            return
        res = self.client.get("/api/lms/modules/", name="/api/lms/modules/")
        if res.status_code == 200:
            modules = res.json()
            if modules:
                target = random.choice(modules)
                self.client.post(
                    f"/api/lms/modules/{target['id']}/progress/",
                    json={"completed": True, "score": 100},
                    name="/api/lms/modules/[id]/progress/",
                )

    @task(4)
    def triage_simulation_inbox(self):
        if not self.token:
            return
        inbox = self.client.get("/api/simulation/inbox/", name="/api/simulation/inbox/")
        if inbox.status_code == 200:
            scenarios = inbox.json().get("scenarios", [])
            if scenarios:
                target = random.choice(scenarios)
                # 80% chance the learner picks the accurate verdict
                is_accurate = random.random() < 0.80
                verdict = target["is_phishing"] if is_accurate else (not target["is_phishing"])
                self.client.post(
                    f"/api/simulation/inbox/{target['id']}/verdict/",
                    json={"is_phishing": verdict},
                    name="/api/simulation/inbox/[id]/verdict/",
                )

    @task(2)
    def scan_url_threat(self):
        if not self.token:
            return
        test_urls = [
            "http://dkut-ac-ke.cloud-auth.online/login.php?client=student",
            "https://github.com/settings/tokens",
            "http://192.168.1.105/mpesa/auth?token=9281",
            "https://console.cloud.google.com/billing",
            "http://dhl-delivery-clearance.top/pay/settle.html",
        ]
        self.client.post(
            "/api/scanner/analyze/",
            json={"url": random.choice(test_urls)},
            name="/api/scanner/analyze/",
        )

    @task(1)
    def check_assessment_status(self):
        if not self.token:
            return
        self.client.get("/api/simulation/quiz/questions/", name="/api/simulation/quiz/questions/")