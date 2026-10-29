"""Proves the Razorpay signature-verification wiring is correct, without any real
Razorpay test keys (none are available in this environment — see
docs/DECISIONS.md "Real Razorpay integration" entry). Uses the SDK's own
`verify_payment_signature` helper against a manually-HMAC'd signature computed with a
fake, locally-generated secret — no invented Razorpay-looking order/payment ids are
sourced or presented as real.
"""

import hashlib
import hmac

import pytest
import razorpay
import razorpay.errors

FAKE_KEY_SECRET = "fake_test_secret_for_unit_test_only"


def _sign(order_id: str, payment_id: str, secret: str) -> str:
    msg = f"{order_id}|{payment_id}"
    return hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()


def test_verify_payment_signature_accepts_correctly_signed_payload():
    client = razorpay.Client(auth=("rzp_test_fake", FAKE_KEY_SECRET))
    order_id = "order_fake_local_test_123"
    payment_id = "pay_fake_local_test_456"
    signature = _sign(order_id, payment_id, FAKE_KEY_SECRET)

    # Should not raise.
    client.utility.verify_payment_signature(
        {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        }
    )


def test_verify_payment_signature_rejects_tampered_signature():
    client = razorpay.Client(auth=("rzp_test_fake", FAKE_KEY_SECRET))
    order_id = "order_fake_local_test_123"
    payment_id = "pay_fake_local_test_456"
    signature = _sign(order_id, payment_id, FAKE_KEY_SECRET)
    tampered = signature[:-1] + ("0" if signature[-1] != "0" else "1")

    with pytest.raises(razorpay.errors.SignatureVerificationError):
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": tampered,
            }
        )
