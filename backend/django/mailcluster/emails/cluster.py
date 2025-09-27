# backend/django_mailcluster/emails/cluster.py
from collections import defaultdict
from .trie import Trie
from .preprocessor import Preprocessor
from .disjoint_set import DisjointSet
from .models import Email

class Cluster:
    def __init__(self, threshold=2):
        """
        threshold: minimum number of shared words to consider two emails in same cluster
        """
        self.threshold = threshold

    def cluster_emails(self, graph=None):
        """Cluster emails using Trie + DSU with a threshold.
        Returns dict: { dsu_root_email_id: [email_id, ...], ... }
        """
        all_emails = list(Email.objects.all())
        if not all_emails:
            return {}

        preproc = Preprocessor()
        trie = Trie()

        # DSU sized by max email_id to avoid fixed arbitrary caps
        max_id = max(e.email_id for e in all_emails)
        dsu = DisjointSet(max_id + 1)

        # Insert tokens from subject+body
        for e in all_emails:
            content = f"{e.subject or ''} {e.body or ''}"
            tokens = preproc.preprocess_email(content)
            for token in tokens:
                trie.insert_word(token, e.email_id)

        # Count shared words
        shared_counts = defaultdict(lambda: defaultdict(int))
        self._count_shared_words(trie.get_root(), shared_counts)

        # Union by threshold
        for email1, neighbors in shared_counts.items():
            for email2, count in neighbors.items():
                if count >= self.threshold:
                    dsu.union_by_rank(email1, email2)

        # Build clusters mapping DSU root -> [email_id...]
        clusters = defaultdict(list)
        for e in all_emails:
            root = dsu.find_upar(e.email_id)
            clusters[root].append(e.email_id)

        return clusters

    def _count_shared_words(self, node, shared_counts):
        if not node:
            return
        emails = node.emailids
        n = len(emails)
        if n > 1:
            for i in range(n):
                for j in range(i+1, n):
                    shared_counts[emails[i]][emails[j]] += 1
                    shared_counts[emails[j]][emails[i]] += 1
        for child in node.next.values():
            self._count_shared_words(child, shared_counts)
