from jobs.models import DeliveryJob


def get_active_delivery(user):
    return (
        DeliveryJob.objects.filter(
            player__user=user,
            status=DeliveryJob.Status.ACTIVE,
        )
        .first()
    )