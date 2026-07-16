<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ThrottlesPosting;
use Illuminate\Foundation\Http\FormRequest;

class StoreRepostRequest extends FormRequest
{
    use ThrottlesPosting;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:500'],
        ];
    }
}
