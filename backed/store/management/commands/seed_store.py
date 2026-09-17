from django.core.management.base import BaseCommand
from store.models import Material


MATERIALS = [
    dict(title='Research Proposal Writing Guide', slug='research-proposal-writing-guide', category='Research', description='A clear guide to choosing a topic, developing objectives and structuring a research proposal.', file_type='PDF', access='free', price=0, order=1),
    dict(title='Chapter One Notes', slug='chapter-one-notes', category='Research', description='Practical notes on background, problem statement, objectives, questions, scope and significance.', file_type='PDF', access='paid', price=15000, order=2),
    dict(title='Literature Review Made Simple', slug='literature-review-made-simple', category='Research', description='How to search, organize, compare and synthesize literature without turning the chapter into summaries.', file_type='PDF', access='paid', price=20000, order=3),
    dict(title='Business Communication Notes', slug='business-communication-notes', category='Communication', description='Professional writing, email etiquette, meetings, presentations and workplace communication essentials.', file_type='PDF', access='free', price=0, order=4),
    dict(title='Data Collection Methods Guide', slug='data-collection-methods-guide', category='Research', description='A concise comparison of questionnaires, interviews, observation and document review.', file_type='PDF', access='paid', price=12000, order=5),
    dict(title='Presentation Skills Checklist', slug='presentation-skills-checklist', category='Communication', description='A one-page preparation checklist for confident academic and professional presentations.', file_type='DOCX', access='free', price=0, order=6),
    dict(title='Basic Statistics for Research', slug='basic-statistics-for-research', category='Data Analysis', description='Beginner-friendly notes on descriptive statistics, interpretation and presenting findings.', file_type='PDF', access='paid', price=18000, order=7),
]


class Command(BaseCommand):
    help = 'Seed the simple public learning-material store.'

    def handle(self, *args, **options):
        for item in MATERIALS:
            slug = item['slug']
            defaults = {**item, 'currency': 'UGX', 'is_published': True}
            defaults.pop('slug')
            Material.objects.update_or_create(slug=slug, defaults=defaults)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(MATERIALS)} store materials. Upload the real files from the admin portal.'))
