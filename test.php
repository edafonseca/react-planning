<?php

$expireAt = new DateTime();
// $expireAt->modify('next hour');

    $expireAt->setTime((int) $expireAt->format('H') + 1, 0);
var_dump($expireAt->format('Y-m-d H:i:s'));
