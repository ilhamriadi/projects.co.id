<html>

<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="<?= base_url('assets/bootstrap/css/bootstrap.min.css') ?>" />
    <link rel="stylesheet" href="<?= base_url('assets/fontawesome/css/fontawesome.min.css') ?>" />
    <link rel="stylesheet" href="<?= base_url('assets/fontawesome/css/all.min.css') ?>" />
    <style>
        h2 {
            font-size: 22px;
        }

        h3 {
            font-size: 18px;
        }

        code {
            white-space-collapse: preserve-breaks;
            color: #000000;
        }
    </style>
</head>

<body>
    <div class="container-fluid my-3">
        <div>
            <div>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>post_title</th>
                            <th>post_excerpt</th>
                            <!--   <th>tax:product_tag </th> -->
                            <th>post_content</th>
                            <th>tgl_berangkat</th>
                            <th>harga_quad</th>
                            <th>harga_triple</th>
                            <th>harga_double</th>
                            <th>sisa_seat</th>
                            <th>total_seat</th>
                            <th>url_image</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        // TASK 1: Sort data by tgl_berangkat Z-A (keberangkatan paling jauh di atas)
                        $filtered_data = [];
                        foreach ($listjadwal as $d) {
                            $datenow = date('Y-m-d');
                            $sisaseat = $d['seat_sisa'];
                            $seaterpakai = $d['seat_total'] - $d['seat_sisa'];
                            if ($d['berangkat_tgl'] >= date('Y-m-d') && $sisaseat > 0) {
                                $filtered_data[] = $d;
                            }
                        }

                        // Sort by berangkat_tgl descending (Z-A) - keberangkatan paling jauh di atas
                        usort($filtered_data, function($a, $b) {
                            return strcmp($b['berangkat_tgl'], $a['berangkat_tgl']);
                        });

                        foreach ($filtered_data as $d) {
                                $date1 = new DateTime($d['berangkat_tgl']);
                                $date2 = new DateTime($d['pulang_tgl']);
                                $diff = $date1->diff($date2);
                                $days = $diff->days + 1;

                                $pakethotel = $d['paket_hotel'];
                                $mekkah_hotel = [];
                                foreach ($pakethotel as $i => $e) {
                                    $mekkah_hotel[] = $e['mekkah_hotel'] . ' *' . $e['mekkah_bintang'];
                                }
                                $mekkah_hotel = implode(',', $mekkah_hotel);

                                $madinah_hotel = [];
                                foreach ($pakethotel as $i => $e) {
                                    $madinah_hotel[] = $e['madinah_hotel'] . ' *' . $e['madinah_bintang'];
                                }
                                $madinah_hotel = implode(' , ', $madinah_hotel);

                                // TASK 2 & 3: Buat 4 variasi produk dengan harga berbeda
                                $variations = [
                                    ['type' => 'Quad', 'suffix' => ' - Quad (4 orang/kamar)'],
                                    ['type' => 'Triple', 'suffix' => ' - Triple (3 orang/kamar)'],
                                    ['type' => 'Double', 'suffix' => ' - Double (2 orang/kamar)'],
                                    ['type' => 'Reguler', 'suffix' => ' - Reguler']
                                ];

                                foreach ($variations as $variation) {
                        ?>
                                <tr>
                                    <td>
                                        <code><?= htmlspecialchars($d['jadwal_nama'] . $variation['suffix']) ?></code>
                                    </td>
                                    <td>
                                        <code>
                                            <?php ob_start(); ?>
                                            <html>
                                            <head>
                                            <style>
                                            table {
                                                border-collapse: collapse;
                                                width: 100%;
                                            }
                                            td, th {
                                                border: 1px solid #dedede;
                                                text-align: left;
                                                padding: 8px;
                                            }
                                            </style>
                                            </head>
                                            <body>
                                            <table>
                                            <tr><td>Keberangkatan</td><td> <?= $this->lib->tglIndo($d['berangkat_tgl']) ?></td></tr>
                                            <tr><td>Durasi</td><td> <?= preg_replace('/\D/', '', $d['jadwal_nama']) ?> Hari</td></tr>
                                            <tr><td>Maskapai</td><td> <?= $d['maskapai'] ?></td></tr>
                                            <tr><td>Rute</td><td><?= $d['berangkat_rute'] ?> |  <?= $d['pulang_rute'] ?></td></tr>
                                            <tr><td>Hotel Makkah</td><td> <?= $mekkah_hotel ?></td></tr>
                                            <tr><td>Hotel Madinah</td><td> <?= $madinah_hotel ?></td></tr>
                                            <tr><td>Tipe Kamar</td><td><?= $variation['type'] ?></td></tr>
                                            </table>
                                            </body>
                                            </html>
                                            <?php echo htmlspecialchars(ob_get_clean()); ?>
                                        </code>
                                    </td>
                                    <!--  <td></td> -->
                                    <td>
                                        <code>
                                            <?php ob_start(); ?>
                                            <div>
                                                <h2>Keberangkatan</h2>
                                            </div>
                                            <div><?= $this->lib->tglIndo($d['berangkat_tgl']) ?></div>
                                            <div>
                                                <h2>Durasi</h2>
                                            </div>
                                            <div><?= $days ?> Hari</div>
                                            <div>
                                                <h2>Maskapai</h2>
                                            </div>
                                            <div><?= $d['maskapai'] ?></div>
                                            <div>
                                                <h2>Tipe Kamar</h2>
                                            </div>
                                            <div><?= $variation['type'] ?></div>
                                            <div>
                                                <h2>Harga Paket</h2>
                                            </div>
                                            <?php
                                            foreach ($d['paket_harga'] as $i => $e) {
                                            ?>
                                                <div><b><?= $i ?></b></div>
                                                <?php
                                                foreach ($e as $j => $f) {
                                                ?>
                                                    <div><?= $j ?> : Rp. <?= $this->lib->rupiah($f) ?></div>
                                            <?php
                                                }
                                            }
                                            ?>
                                            <div>Perlengkapan & handling : Rp <?= $this->lib->rupiah($d['perlengkapan_harga']) ?></div>
                                            <div>
                                                <h3>Maskapai: <?= $d['maskapai'] ?></h3>
                                            </div>
                                            <div>Keberangkatan: <?= strtoupper($this->lib->tglIndoShort($d['berangkat_tgl'])) ?> <?= $d['berangkat_rute'] ?> <?= $d['berangkat_kode_penerbangan'] ?> <?= $d['berangkat_jam'] ?></div>
                                            <div>Kepulangan: <?= strtoupper($this->lib->tglIndoShort($d['pulang_tgl'])) ?> <?= $d['pulang_rute'] ?> <?= $d['pulang_kode_penerbangan'] ?> <?= $d['pulang_jam'] ?></div>
                                            <div>
                                                <h3>Hotel</h3>
                                            </div>
                                            <div>Hotel Makkah: <?= $mekkah_hotel ?></div>
                                            <div>Hotel Madinah: <?= $madinah_hotel ?></div>
                                            <div>
                                                <h3>Itinerary</h3>
                                            </div>
                                            <div><iframe src="https://apps.alhijaz.travel/jadwal/itinerary?iti=<?= $d['itinerary'] ?>" width="600" height="400"></iframe></div>
                                            <div><b>Booking Seat & Pelunasan</b></div>
                                            <div>- Biaya booking seat Rp 9jt/ orang. DP transfer ke rekening PT Alhijaz Indowisata. Kirim bukti pembayaran & foto KTP melalui WhatsApp.</div>
                                            <div>- Pelunasan maks H-30 keberangkatan</div>
                                            <div><b>Persyaratan Dokumen</b></div>
                                            <div>- Paspor nama 2 kata & masa berlaku minimal 8 bulan sebelum tanggal keberangkatan</div>
                                            <div>- Vaksin Meningitis e-ICV (Electronic Certificate of Vaccination)</div>
                                            <div>- Vaksin Polio</div>
                                            <div>- Copy KTP</div>
                                            <div>- Copy KK</div>
                                            <div>- Copy Akta Lahir (Jamaah Anak)</div>
                                            <div>- Penyerahan Dokumen Maks H-30</div>
                                            <div><b>Harga Termasuk</b></div>
                                            <div>- Tiket pesawat PP ekonomi start Jakarta</div>
                                            <div>- Hotel Madinah, Makkah</div>
                                            <div>- Visa Umrah</div>
                                            <div>- Makan & minum (fullboard)</div>
                                            <div>- Muthawwif (bahasa indonesia)</div>
                                            <div>- Asuransi Zurich Syariah</div>
                                            <div>- Transportasi Bus AC dan Driver</div>
                                            <div>- Air Zamzam 5 L (jika diijinkan maskapai)</div>
                                            <div><b>Harga tidak termasuk</b></div>
                                            <div>- Paspor</div>
                                            <div>- Buku vaksin meningitis</div>
                                            <?php echo htmlspecialchars(ob_get_clean()); ?>
                                        </code>
                                    </td>
                                    <td><?= $this->lib->tglIndo($d['berangkat_tgl']) ?></td>
                                    <td>
                                        <?php
                                        // TASK 3: Harga Quad - lebih robust dengan multiple variations
                                        $harga_quad = 0;
                                        $found = false;
                                        foreach ($d['paket_harga'] as $i => $e) {
                                            foreach ($e as $j => $f) {
                                                if (strtolower($j) == 'quard' || strtolower($j) == 'quad') {
                                                    echo "Rp. " . $this->lib->rupiah($f);
                                                    $harga_quad = $f;
                                                    $found = true;
                                                    break 2;
                                                }
                                            }
                                        }
                                        // Jika tidak ada harga quad, gunakan harga terendah sebagai fallback
                                        if (!$found) {
                                            echo "Rp. " . $this->lib->rupiah($d['harga_terendah'] ?? 0);
                                        }
                                        ?>
                                    </td>
                                    <td>
                                        <?php
                                        // TASK 3: Harga Triple
                                        $harga_triple = 0;
                                        $found = false;
                                        foreach ($d['paket_harga'] as $i => $e) {
                                            foreach ($e as $j => $f) {
                                                if (strtolower($j) == 'triple') {
                                                    echo "Rp. " . $this->lib->rupiah($f);
                                                    $harga_triple = $f;
                                                    $found = true;
                                                    break 2;
                                                }
                                            }
                                        }
                                        // Jika tidak ada harga triple, gunakan harga terendah + markup
                                        if (!$found && isset($d['harga_terendah'])) {
                                            $markup = $d['harga_terendah'] * 0.1; // 10% markup
                                            echo "Rp. " . $this->lib->rupiah($d['harga_terendah'] + $markup);
                                        }
                                        ?>
                                    </td>
                                    <td>
                                        <?php
                                        // TASK 3: Harga Double
                                        $harga_double = 0;
                                        $found = false;
                                        foreach ($d['paket_harga'] as $i => $e) {
                                            foreach ($e as $j => $f) {
                                                if (strtolower($j) == 'double') {
                                                    echo "Rp. " . $this->lib->rupiah($f);
                                                    $harga_double = $f;
                                                    $found = true;
                                                    break 2;
                                                }
                                            }
                                        }
                                        // Jika tidak ada harga double, gunakan harga terendah + markup lebih besar
                                        if (!$found && isset($d['harga_terendah'])) {
                                            $markup = $d['harga_terendah'] * 0.2; // 20% markup
                                            echo "Rp. " . $this->lib->rupiah($d['harga_terendah'] + $markup);
                                        }
                                        ?>
                                    </td>
                                    <td><?= $sisaseat ?></td>
                                    <td><?= $d['seat_total'] ?></td>
                                    <td><?= $d['brosur'] ?></td>
                                </tr>
                        <?php
                                } // end foreach variations
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
    <script src="<?= base_url('assets/js/jquery.min.js') ?>"></script>
    <script src="<?= base_url('assets/bootstrap/js/bootstrap.min.js') ?>"></script>
    <script src="<?= base_url('assets/js/masonry.pkgd.min.js') ?>"></script>
</body>

</html>