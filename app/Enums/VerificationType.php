<?php

namespace App\Enums;

enum VerificationType: int
{
    case None = 0;
    case Verified = 1;
    case Company = 2;
}
