import { TowersService } from './towers.service';
import { CreateTowerDto } from './dto/create-tower.dto';
import { UpdateTowerDto } from './dto/update-tower.dto';
export declare class TowersController {
    private towersService;
    constructor(towersService: TowersService);
    findAll(query: {
        tipe?: string;
        kondisi?: string;
        search?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        data: {
            id: string;
            nama: string;
            lat: number;
            lng: number;
            tegangan: string;
            tipe: string;
            kondisi: string;
            lokasi: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAllForMap(): Promise<{
        id: string;
        nama: string;
        lat: number;
        lng: number;
        tipe: "gardu" | "SUTET" | "SUTT" | "SKTT";
        tegangan: string;
        updatedAt: string;
        kerawanan: {
            kategori: string;
            level: "tinggi" | "sedang" | "rendah";
            status: string;
        }[];
    }[]>;
    findAllForDropdown(): Promise<{
        id: string;
        nomorTower: string;
        garduInduk: string;
        tipe: string;
        tegangan: string;
        nama: string;
    }[]>;
    findOne(id: string): Promise<{
        laporan: ({
            pelapor: {
                id: string;
                nama: string;
                jabatan: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            foto: string[];
            teknisi: string | null;
            jenisGangguan: string;
            deskripsi: string;
            levelRisiko: string;
            status: string;
            tanggal: Date;
            lokasiDetail: string | null;
            keterangan: string | null;
            noSpk: string | null;
            temuan: string | null;
            hasil: string | null;
            penyebab: string | null;
            durasi: string | null;
            towerId: string;
            pelaporId: string;
        })[];
        sertifikat: {
            id: string;
            nama: string;
            tipe: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            towerId: string;
            berlakuHingga: Date;
            fileUrl: string | null;
        }[];
        asBuilt: {
            id: string;
            tipe: string;
            createdAt: Date;
            updatedAt: Date;
            keterangan: string | null;
            towerId: string;
            tahun: number;
            fileUrl: string | null;
            namaFile: string;
            versi: string | null;
        }[];
    } & {
        id: string;
        nama: string;
        lat: number;
        lng: number;
        tegangan: string;
        tipe: string;
        kondisi: string;
        lokasi: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateTowerDto): import("@prisma/client").Prisma.Prisma__TowerClient<{
        id: string;
        nama: string;
        lat: number;
        lng: number;
        tegangan: string;
        tipe: string;
        kondisi: string;
        lokasi: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateTowerDto): Promise<{
        id: string;
        nama: string;
        lat: number;
        lng: number;
        tegangan: string;
        tipe: string;
        kondisi: string;
        lokasi: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        nama: string;
        lat: number;
        lng: number;
        tegangan: string;
        tipe: string;
        kondisi: string;
        lokasi: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
